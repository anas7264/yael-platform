import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { User } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { groq, MODELS } from '@/lib/ai/groq';
import { CHAT_PROMPT, type ChatMessage as PromptChatMessage } from '@/lib/ai/prompts';
import { withAuthRateLimitValidation } from '@/lib/api/middleware';

const ChatSchema = z.object({
  message: z.string().min(1),
  conversationId: z.string().uuid().optional(),
});

type ChatBody = z.infer<typeof ChatSchema>;

async function chatHandler(req: NextRequest, user: User, body: ChatBody): Promise<NextResponse> {
  const { message, conversationId } = body;
  const supabaseAdmin = createAdminClient();

  let activeConversationId = conversationId;
  let history: PromptChatMessage[] = [];

  if (activeConversationId) {
    const { data: messages } = await supabaseAdmin
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (messages) {
      history = messages.reverse().map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));
    }

    await supabaseAdmin.from('chat_messages').insert({
      conversation_id: activeConversationId,
      role: 'user',
      content: message,
    });
  } else {
    const { data: conv } = await supabaseAdmin
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        title: message.substring(0, 50) + '...',
        message_count: 1,
        is_active: true,
      })
      .select('id')
      .single();

    if (conv) {
      activeConversationId = conv.id;
      await supabaseAdmin.from('chat_messages').insert({
        conversation_id: activeConversationId,
        role: 'user',
        content: message,
      });
    }
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('full_name, experience_level')
    .eq('id', user.id)
    .single();

  const context = {
    studentName: profile?.full_name,
    studentLevel: profile?.experience_level,
  };

  const systemMessage = CHAT_PROMPT(context, history);

  const groqMessages: PromptChatMessage[] = [
    { role: 'system', content: systemMessage },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message },
  ];

  const stream = await groq.chat.completions.create({
    model: MODELS.complex,
    messages: groqMessages,
    temperature: 0.7,
    max_tokens: 1024,
    stream: true,
  });

  const encoder = new TextEncoder();

  const customStream = new ReadableStream({
    async start(controller) {
      let fullResponse = '';
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullResponse += content;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        if (activeConversationId) {
          await supabaseAdmin.from('chat_messages').insert({
            conversation_id: activeConversationId,
            role: 'assistant',
            content: fullResponse,
          });

          const { data: conv } = await supabaseAdmin
            .from('chat_conversations')
            .select('message_count')
            .eq('id', activeConversationId)
            .single();

          if (conv) {
            await supabaseAdmin
              .from('chat_conversations')
              .update({ message_count: conv.message_count + 1 })
              .eq('id', activeConversationId);
          }
        }
        controller.close();
      }
    },
  });

  return new NextResponse(customStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export const POST = withAuthRateLimitValidation(ChatSchema, 'ai', chatHandler);
