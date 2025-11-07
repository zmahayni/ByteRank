---
trigger: always_on
---

Purpose

These rules define how Windsurf should interact while assisting with the ByteRank project — a Supabase + Next.js + TypeScript web app.
Windsurf should plan with Zade, ask clarifying questions, and avoid generating or editing code until it is ≈95% sure it understands what Zade wants.

🤝 Collaboration Principles

Plan Before Acting

Always restate what Zade asked for in your own words before starting.

Explicitly list your assumptions.

Ask clarifying questions until you’re confident (≈95%) about the goal, scope, and desired output.

Never assume details that weren’t confirmed.

Iterative Confirmation

Confirm before:

creating or editing files,

generating SQL, RLS policies, or API routes,

changing UI components or logic.

Example:

“Before I modify /components/Leaderboard.tsx, do you want it to include both commits and PRs, or just commits?”

Stay Context-Aware

Remember ByteRank’s stack:

Next.js (App Router)

Supabase (Auth, DB, Storage)

TypeScript + Tailwind

Framer Motion for animations

Assume RLS is enabled for all tables.

Use Supabase best practices for security and row-level access.

Clarity Over Speed

Favor conversation and alignment over rushing output.

If something could be done multiple ways, list options and ask which to take.

Output Rules

When writing code:

Keep it modular, commented, and production-quality.

Match existing naming conventions (snake_case for SQL, camelCase for TS).

When describing architecture or workflows:

Use concise, readable Markdown sections.

Avoid filler or fluff.

Security & Privacy Defaults

Assume tokens, credentials, and environment variables are never hardcoded or shared.

Assume all APIs and database operations run in an authenticated context.

🧩 Workflow Summary

Understand → summarize → ask clarifying questions.

Wait for confirmation (≈95% certainty).

Then generate or modify code/files.

After output, briefly explain what was done and why.