-- Learning "AI/tech tip of the day": same static curated-pool pattern as
-- coding_tips / health_tips (deterministic rotation, no AI — avoids the
-- hallucination risk of generating fresh "facts" daily).
create table if not exists learning_tips (
  id uuid primary key default gen_random_uuid(),
  tip text not null,
  created_at timestamptz not null default now()
);
alter table learning_tips enable row level security;
create policy "authenticated can read learning_tips" on learning_tips
  for select using (auth.role() = 'authenticated');

alter table daily_tips_log drop constraint if exists daily_tips_log_category_check;
alter table daily_tips_log add constraint daily_tips_log_category_check
  check (category in ('coding', 'health', 'learning'));

-- Seed learning tips (30 to start — expand the pool by hand later; it's a
-- flat table, not code, so growing it needs no app changes).
insert into learning_tips (tip) values
('A "context window" is the max tokens (prompt + history + output) a model can attend to at once — once it''s full, the oldest content gets truncated or summarized, not remembered indefinitely.'),
('RAG (Retrieval-Augmented Generation) grounds an LLM''s answer in retrieved documents at query time, instead of baking facts into the model''s weights — it''s why RAG can cite sources and stay current without retraining.'),
('Fine-tuning changes a model''s weights on your data; prompting/in-context learning changes nothing about the model — it just conditions one generation. Fine-tuning is for teaching style/format, not new facts (RAG is better for facts).'),
('Embeddings turn text into vectors where semantic similarity becomes geometric distance — "king - man + woman ≈ queen" is the classic demo of this arithmetic working on meaning.'),
('Temperature controls sampling randomness, not "creativity" per se — temperature 0 makes the model greedy (always picks the highest-probability token), which is why factual/structured tasks often use low or zero temperature.'),
('Tokens aren''t words — a token is often a word-piece; "unbelievable" might split into "un", "believ", "able". This is why LLMs are famously bad at counting letters in a word: they don''t see individual letters.'),
('Prompt caching lets a provider reuse the KV-cache computation for a repeated prefix (like a long system prompt) across calls — same output, much lower cost and latency for the cached portion.'),
('Chain-of-thought prompting ("think step by step") improves accuracy on multi-step reasoning not by making the model "smarter," but by giving it more intermediate tokens to compute in before committing to an answer.'),
('Hallucination isn''t the model "lying" — it''s the model generating the statistically plausible next token with no built-in fact-check, so a confident wrong answer looks identical to a confident right one.'),
('Function/tool calling works by the model outputting structured JSON matching a schema you provide — the model doesn''t execute code itself, your application does, then feeds the result back in as another message.'),
('A "system prompt" and a "user prompt" are just messages with different roles in the same context window — the model doesn''t have separate memory for them, it just tends to weight system instructions more heavily by training convention.'),
('Mixture-of-Experts (MoE) models route each token through a subset of specialized sub-networks instead of the whole model — more total parameters, but only a fraction activate per token, keeping inference cheap.'),
('LLMs are stateless between API calls — "conversation memory" is an illusion created by resending the full chat history as context on every request, not the model actually remembering anything.'),
('Quantization shrinks a model by storing weights in fewer bits (e.g. 16-bit → 4-bit) — it trades a small accuracy hit for large gains in memory and inference speed, which is how large models run on consumer hardware.'),
('React Server Components run only on the server and never ship their JS to the browser — they can be async and touch a database directly, which is why Next.js App Router pages can `await` a fetch with no client-side loading state.'),
('useEffect cleanup functions run before the NEXT effect, not just on unmount — easy to forget when debugging a "runs twice" bug in React Strict Mode during development.'),
('CSS container queries (@container) let a component respond to its own container''s width, not just the viewport — real component-level responsiveness, unlike media queries.'),
('Next.js `generateStaticParams` decides which dynamic routes get pre-rendered at build time — anything not listed falls back to on-demand rendering (or 404, depending on `dynamicParams`).'),
('The "grounding" problem in AI agents is getting a model''s output to actually correspond to real, current, verifiable state — it''s the core reason agentic systems need tool calls to real APIs, not just better prompting.'),
('Speculative decoding speeds up LLM inference by having a small, fast "draft" model guess several tokens ahead, which the large model then verifies in parallel — same output distribution, lower latency.'),
('An AI agent, as a term of art, is usually defined as an LLM in a loop: it observes state, decides an action (often a tool call), executes it, and re-evaluates — the loop, not the model alone, is what makes it "agentic."'),
('React''s reconciliation (the "diffing" algorithm) is O(n) not O(n³) because it assumes elements of different types produce different trees and uses keys to match list items — a heuristic, not exhaustive tree comparison.'),
('Vector databases don''t just store embeddings — their real job is approximate nearest-neighbor search (e.g. HNSW indexes) that scales sub-linearly, since brute-force cosine similarity over millions of vectors is too slow.'),
('LLM "jailbreaks" typically exploit the gap between a model''s training-time safety alignment and its instruction-following behavior at inference time — framing a request as fiction, translation, or a hypothetical often bypasses pattern-matched refusals.'),
('A model''s "knowledge cutoff" reflects when its training data was collected, not when it was released — a model released today may still not know about anything from the last several months unless paired with retrieval/search tools.'),
('CSS `:has()` lets you style a parent based on its children, e.g. `.card:has(img)` — a real parent selector in CSS, no JS needed.'),
('Next.js Suspense boundaries let you stream a page: the shell renders immediately while slower data-fetching components show a fallback and "pop in" when ready, instead of blocking the whole page on the slowest query.'),
('Multi-modal models process images via a vision encoder that turns image patches into tokens the same transformer can attend to alongside text tokens — not a separate image-captioning step bolted on.'),
('Constitutional AI / RLHF-style alignment trains a model''s behavior using human (or AI-generated) preference comparisons between outputs, not explicit rules — the model learns a style/values gradient, not a hardcoded policy.'),
('Structured outputs (JSON mode / schema-constrained decoding) work by masking the token probabilities at each step to only allow tokens valid for the schema at that position — the model literally cannot emit invalid JSON, not just "trying hard" to.')
on conflict do nothing;
