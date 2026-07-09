Act as an Elite Meta-Prompt Engineer and Principal Software Architect. I have designed a world-class, intelligent EdTech platform to prepare Arabic-speaking students for the Israeli YAEL exam (aiming for 120+ scores). I have 8 extremely detailed Markdown documents covering the System Architecture, UX/UI Design, DB Schema, AI/Tutoring Pipeline, and the Mathematical Adaptive Engine (BKT, IRT, FSRS).

YOUR SOLE OBJECTIVE:
Write a "Genius Master Prompt" that I will copy and paste into **Claude Haiku 4.5 Extended**.

The prompt you create MUST instruct Claude to act as a Senior Technical Lead and generate a highly structured file named `yael_prompts.md`. This file must contain an unbroken, sequential pipeline of 50+ atomic prompts designed to build the entire platform from scratch to production.

CRITICAL CONSTRAINTS YOU MUST ENFORCE IN YOUR PROMPT FOR CLAUDE:

1. Tech Stack Mastery: The prompts must strictly utilize Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Edge Functions), and **Groq API** (for extremely fast, cost-effective LLM agentic workflows and Arabic-Hebrew linguistic bridges).
2. Autonomous GitHub Integration Rule: I do not copy and paste code manually. Claude must be instructed to write prompts that operate under the assumption that the AI executing them will push, modify, and commit code *directly* to the GitHub repository. My only action will be approving the pull requests/commits. The generated prompts must ask the executing AI to "create the file," "update the component," and "push the changes."
3. Extreme Atomicity & Sequencing: The 50+ prompts must be flawlessly ordered.
- Phase 1: Environment, GitHub initialization, and Supabase setup.
- Phase 2: DB Schema (UUIDs, RLS policies, pgvector for vocab embeddings) and Edge Functions.
- Phase 3: Core UI Primitives (RTL-first, Arabic primary, Hebrew islands in LTR, Tailwind tokens).
- Phase 4: Mathematical Adaptive Engine (BKT, IRT, FSRS implementation in TypeScript).
- Phase 5: Groq API Routes & AI caching logic.
- Phase 6: Pages, Dashboards, and Testing.
4. Zero-Placeholder Policy: The executing AI must write 100% production-ready, complete code for every step. No `// add logic here` or `// todo`.
5. Test-Driven Execution: Every single prompt in the pipeline must end with a directive for the executing AI to verify the code runs without type errors or linting issues before moving to the next step.
6. Context Ingestion: Claude must use the 8 MD files (which I will provide to it) as the absolute source of truth for all DB tables, UX copy, color hex codes, and math formulas.

OUTPUT REQUIREMENT:
Do not write the code. Do not write the 50 prompts yourself. Output ONLY the meticulously engineered "Master Prompt" that I will feed to Claude to generate the `yael_prompts.md` file. Use an authoritative, highly technical tone.

Here are the 8 architectural documents you must analyze to write the perfect prompt for Claude:

1.🎨 YAEL Platform — World-Class UX Redesign - (info\🎨 YAEL Platform — World-Class UX Redesign.md)

2.🎯 YAEL Preparation Platform — Strategic Briefing - (info\🎯 YAEL Preparation Platform — Strategic Briefing.md)

3.🏗️ YAEL AI Platform — Complete System Architecture - (info\🏗️ YAEL AI Platform — Complete System Architecture.md)

4.🏗️ YAEL Platform — Complete Frontend Architecture - (info\🏗️ YAEL Platform — Complete Frontend Architecture.md)

5.📐 YAEL AI Platform — Complete Product Design Specification - (info\📐 YAEL AI Platform — Complete Product Design Specification.md)

6.🗄️ YAEL AI Platform — Production Database Architecture - (info\🗄️ YAEL AI Platform — Production Database Architecture.md)

7.🧠 YAEL AI Platform — Intelligent Tutoring System Architecture - (info\🧠 YAEL AI Platform — Intelligent Tutoring System Architecture.md)

8.🧮 YAEL Adaptive Learning Engine — Complete Mathematical Architecture - (info\🧮 YAEL Adaptive Learning Engine — Complete Mathematical Architecture.md)