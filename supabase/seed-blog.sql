-- ============================================================
-- Seed a starter blog post (hot topic: Agentic AI).
-- Paste into Supabase → SQL Editor → Run. Safe to re-run
-- (won't duplicate — keyed on the unique slug).
--
-- Requires blogs.sql to have been run first.
-- ============================================================

insert into blogs (title, slug, excerpt, content, tags, published)
values (
  $t$Agentic AI: The Shift From Chatbots to Software That Acts$t$,
  'agentic-ai-the-shift-from-chatbots-to-software-that-acts',
  $ex$AI is moving from answering questions to actually doing work. A developer's guide to agentic AI — what it is, why it's exploding right now, and how to start building with it.$ex$,
  $md$For the last few years, "AI" mostly meant a chat box: you type a question, it types an answer. Useful — but passive. The conversation has now moved on. The hottest topic in the industry right now is **agentic AI**: systems that don't just respond, they *act* — planning multi-step tasks, calling tools, writing and running code, and course-correcting on their own.

If you build software, this shift matters. Here's what agentic AI actually is, why it's exploding now, and how to start building with it.

## From "answering" to "doing"

A traditional LLM call is a single turn: prompt in, text out. An **agent** wraps that model in a loop:

1. **Perceive** the goal and the current state.
2. **Reason** about the next step.
3. **Act** by calling a tool — search the web, query a database, run code, hit an API.
4. **Observe** the result and repeat — until the goal is met.

That loop is the whole idea. The model becomes the "brain," and tools become its hands. Instead of *"here's how you could deploy your app,"* an agent can actually run the deploy, read the logs, and fix the error it finds.

## Why now?

Three things converged:

- **Models got good at tool use.** Modern models reliably decide *when* to call a function and *with what arguments* — the foundation of agency.
- **Context windows grew.** Agents can hold long task histories, documentation, and intermediate results in working memory.
- **Standards emerged.** Protocols like the Model Context Protocol (MCP) made it easy to plug tools and data sources into any agent, so the ecosystem stopped reinventing the wheel.

The result: coding assistants that scaffold whole features, research agents that browse and synthesize, and "computer-use" agents that operate real interfaces.

## The building blocks

Strip away the hype and most agents are four parts:

- **A model** that can call tools.
- **Tools** — typed functions the model may invoke, like `search(query)` or `runSql(query)`.
- **Memory** — short-term (the current task) and long-term (past facts, retrieved via RAG).
- **An orchestration loop** that runs the perceive → reason → act cycle and knows when to stop.

A minimal version looks like this:

```js
while (!done) {
  const step = await model.decideNextAction(goal, history);
  if (step.type === "final") break;
  const result = await tools[step.tool](step.args);
  history.push({ step, result });
}
```

Everything else — multi-agent teams, planners, verifiers — is elaboration on this core.

## The hard parts

Agentic systems are powerful, but they're not magic:

- **Reliability.** More steps means more places to go wrong. Good agents verify their own work and fail loudly.
- **Cost & latency.** Each loop is another model call. Design for the fewest steps that get the job done.
- **Safety.** An agent that can act can act *wrongly*. Guardrails, human approval for risky actions, and least-privilege tools are non-negotiable.

## How to start (as a developer)

You don't need a research lab. Start small:

1. **Pick one boring, multi-step task** you do often — triaging issues, summarizing PRs, drafting release notes.
2. **Give a model 2–3 tools** to do it, and wrap it in a simple loop.
3. **Add a verification step** — have the agent check its own output before finishing.
4. **Keep a human in the loop** for anything that writes, sends, or deletes.

Start with a provider SDK, and lean on MCP so your tools are reusable across projects.

## The takeaway

We're moving from AI that *talks* to AI that *works*. For developers, that's not a threat — it's leverage. The engineers who thrive won't be the ones who prompt a chatbot fastest; they'll be the ones who can design reliable systems *around* these models: the right tools, the right guardrails, the right place for a human to step in.

Agentic AI is still early, messy, and evolving fast. Which is exactly why now is the best time to start building with it.$md$,
  array['AI', 'Agentic AI', 'Software Engineering'],
  true
)
on conflict (slug) do nothing;
