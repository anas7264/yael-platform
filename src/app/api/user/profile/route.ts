import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // 1. Password Update
    if (body.newPassword) {
      // Supabase updateUser automatically hashes and sets it
      const { error: updateError } = await supabase.auth.updateUser({
        password: body.newPassword
      });
      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }
    }

    // 2. Name Update
    if (body.name) {
      const { error: nameError } = await supabase.auth.updateUser({
        data: { full_name: body.name }
      });
      if (nameError) {
        return NextResponse.json({ error: nameError.message }, { status: 400 });
      }
    }

    // 3. User Progress / Preferences Update (target_score, etc.)
    // Note: We're mocking this table update as we might need a separate preferences table or columns.
    // For now we'll attempt to update 'user_progress' if target_score is sent.
    if (body.target_score !== undefined) {
      const { error: progError } = await supabase
        .from('user_progress')
        .update({ target_score: body.target_score })
        .eq('user_id', user.id);
      
      if (progError) {
        console.error('Error updating target score:', progError);
        // We won't block the request if this mock column doesn't exist yet
      }
    }

    return NextResponse.json({ success: true, message: 'تم حفظ التغييرات بنجاح' });
  } catch (err: unknown) {
    console.error('API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
