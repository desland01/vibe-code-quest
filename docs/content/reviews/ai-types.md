# AI Types content review

Checked: 2026-07-17  
Checker: codex bounded worker; orchestrator URL verification pending

## Claim review

| Landmark | Claim | Source | Checked | Checker |
| --- | --- | --- | --- | --- |
| Model call vs agent | Structured outputs constrain model responses to a supplied schema. | https://platform.openai.com/docs/guides/structured-outputs | 2026-07-17 | codex bounded worker |
| Model call vs agent | Agents use models, tools, and control-flow logic to complete tasks. | https://platform.openai.com/docs/guides/agents | 2026-07-17 | codex bounded worker |
| Model call vs agent | Claude tool use returns tool requests that application code executes. | https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview | 2026-07-17 | codex bounded worker |
| Retrieval-augmented generation | OpenAI retrieval performs semantic search over vector stores. | https://platform.openai.com/docs/guides/retrieval | 2026-07-17 | codex bounded worker |
| Retrieval-augmented generation | Pinecone search supports metadata filters. | https://docs.pinecone.io/guides/search/filter-by-metadata | 2026-07-17 | codex bounded worker |
| Retrieval-augmented generation | Long-context applications still need careful context structure and testing. | https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/long-context-tips | 2026-07-17 | codex bounded worker |
| Tool use | OpenAI function calling uses JSON-schema-defined tools and application-executed calls. | https://platform.openai.com/docs/guides/function-calling | 2026-07-17 | codex bounded worker |
| Tool use | Anthropic documents client and server tools with defined inputs. | https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview | 2026-07-17 | codex bounded worker |
| Tool use | MCP standardizes how AI applications connect to external systems. | https://modelcontextprotocol.io/docs/getting-started/intro | 2026-07-17 | codex bounded worker |
| Workflows vs agents | OpenAI agents combine models, tools, knowledge, and control flow. | https://platform.openai.com/docs/guides/agents | 2026-07-17 | codex bounded worker |
| Workflows vs agents | AI SDK documents sequential, parallel, routing, and loop-based workflow patterns. | https://ai-sdk.dev/docs/agents/workflows | 2026-07-17 | codex bounded worker |
| Workflows vs agents | Tool execution remains an application-controlled boundary. | https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview | 2026-07-17 | codex bounded worker |
| AI evals | OpenAI evals test model outputs against criteria and datasets. | https://platform.openai.com/docs/guides/evals | 2026-07-17 | codex bounded worker |
| AI evals | Anthropic recommends defining task-specific success criteria. | https://docs.anthropic.com/en/docs/test-and-evaluate/define-success | 2026-07-17 | codex bounded worker |
| AI evals | Anthropic recommends representative test cases and automated grading where suitable. | https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests | 2026-07-17 | codex bounded worker |
| Model selection and routing | OpenAI documents models with differing capabilities and modalities. | https://platform.openai.com/docs/models | 2026-07-17 | codex bounded worker |
| Model selection and routing | Anthropic documents model tradeoffs including capability and speed. | https://docs.anthropic.com/en/docs/about-claude/models/overview | 2026-07-17 | codex bounded worker |
| Model selection and routing | AI SDK provider management supports model/provider registries and custom selection. | https://ai-sdk.dev/docs/ai-sdk-core/provider-management | 2026-07-17 | codex bounded worker |

## Voice self-check

- Direct, warm, second-person voice: PASS.
- Hooks are short mental models: PASS.
- Definitions state boundaries without promising correctness or autonomy: PASS.
- Each landmark has four concrete use cases, at least three pros, and at least two cons: PASS.
- Examples use real product work and give the reader an instruction for their agent: PASS.
- Gotchas are imperative, agent-aware, and cover authorization, bounds, evaluation, or side effects: PASS.
- Defaults are decisive and recommend the least complex adequate design: PASS.
- Quizzes have exactly three plausible options and exact canonical answers: PASS.
- No marketing fluff, “simply/just,” interview framing, hedge stacks, or agent mysticism: PASS.

Deviations: None.

## Orchestrator verification

**COMPLETE — 2026-07-18, mission orchestrator (Claude Opus 4.8).** All 15 unique source URLs HTTP-verified 200 on first pass (no dead links). This is the highest-accuracy region; reviewed model-call-vs-agent and retrieval-augmented-generation in full plus hooks/defaults across all 6. Findings: AI concepts are precise and not overstated — agent-autonomy framed honestly (cap steps/time/spend, confirm irreversible tool calls), RAG framed with correct security posture (retrieved text is untrusted data, authorization filters before retrieval, prompt-injection separation), defaults are conservative (single call + structured outputs before agents). VOICE-conformant, no banned patterns. VAL-030: no drafts remain. APPROVED.
