# MRagent Front End Operating Pack

This pack explains how the current MindReply front end works and what each surface is responsible for.

## Surfaces

- `/`: the public front door. It now presents MindReply as a pressure-to-action operating layer with platform layers, workflow, promotion readiness, proof, and observability.
- `/agent`: the live MRagent session. It accepts charged text, explains the slow reply, and returns one synthesis, one recommended move, risk state, memory summary, and a quiet receipt.
- `/pack`: the private completion surface. It shows delivery readiness, revenue truth, promotion queue state, reporting lanes, and confirmed destination status.
- `/privacy`: the restraint page. It explains why raw pressure is not kept as a default record.
- `/mcp`: the ChatGPT App connection surface for Developer Mode.

## How The Interaction Works

1. A user places the charged message or hesitation into MRagent.
2. The browser calls `/api/agent` with the message and source.
3. If the model/provider path is unavailable, the app falls back to `/api/intake`.
4. The decision layer returns a structured result: synthesis, mind read, recommended action, risk, memory summary, and receipt.
5. The UI renders the answer through the AI Elements message component, then displays the structured receipt below it.
6. Persistence remains privacy-safe: no raw input is stored by default, and Blob storage is private when configured.

## Full Front End Map

The front end is intentionally not a marketing-only page. It is the usable product surface:

- Hero: product identity, value, and embedded MRagent chat preview.
- Platform layers: intake, behavioral read, action composer, and quiet receipt.
- Workflow: place the pressure, slow the read, act once, report what moved.
- Promotion readiness: MRadvertisingTeam, promotion queue, and revenue readiness without fake posting claims.
- Proof and observability: Vercel deploy guard, Speed Insights, email/Slack readiness, and Figma/Remotion handoff state.
- Completion pack: delivery status, real revenue counters, report lanes, and blockers.

## Personal Pack Reporting

The GitHub workflow `.github/workflows/personal-pack-report.yml` runs every 30 minutes with a default 25-lane report pack.

The report covers:

- front door voice
- MRagent session
- Completion Pack
- privacy posture
- ChatGPT App surface
- receipt contract
- risk gate
- delivery readiness
- Slack readiness
- email readiness
- Vercel deploy state
- GitHub source state
- Figma preview
- FigJam map
- Code Connect readiness
- Remotion motion brief
- observability watch
- conversion source watch
- revenue truth
- transaction source watch
- positioning phrases
- promotion queue
- launch blockers
- useful material
- next move

Delivery is intentionally gated. Console output is not treated as real delivery when `MINDREPLY_REPORT_REQUIRE_DELIVERY=true`. Slack requires `MINDREPLY_SLACK_WEBHOOK_URL`. Email requires `RESEND_API_KEY`, `MINDREPLY_REPORT_EMAILS`, `MINDREPLY_REPORT_EMAIL_ALLOWLIST`, and `MINDREPLY_REPORT_FROM`.

Confirmed report destination for the app copy is `ANGELLLKR@GMAIL.COM`.

## Automation Guardrails

The safe automation posture is:

- prepare campaign material, do not publish externally without connected accounts and explicit approval;
- report blockers directly instead of pretending an integration works;
- avoid stealth posting, guaranteed reach, or guaranteed revenue language;
- keep deployment work on guarded branches until production approval is explicit;
- keep transaction and revenue counters tied to real sources.

## Motion Direction

A Remotion spot should show MindReply without loud product theatrics:

- Scene 1: a charged message sits on a quiet field.
- Scene 2: the words dim while pressure, protection, risk, and next move become visible.
- Scene 3: one composed reply appears beside a narrow receipt.
- Scene 4: the Completion Pack receives the status without exposing the original text.

Motion should be restrained: slow fades, precise reveals, no fake revenue, no exaggerated claims.

## Promotion Positioning

Promotion should not promise hidden posting, guaranteed revenue, or platform-wide distribution without connected accounts. The safe posture is:

- publish only where accounts and permissions are real;
- report what was prepared, sent, or blocked;
- keep the language private, elegant, and specific;
- never invent transactions, audience response, or revenue.

Use this line as the campaign spine:

> Read the pressure. Move with grace. Keep the receipt narrow.

## Figma State

- Existing preview: https://www.figma.com/design/QLximv9mLCIwQB2GPgBgeG
- New direction file: https://www.figma.com/design/PuRHREBbTixXGxPsBEI1yz
- FigJam operating map: https://www.figma.com/board/G0lSiegpqHSoQDpmgoYKDL

The Figma MCP Starter limit blocked further frame placement and Code Connect mapping. Once the limit is cleared, the next Figma step is to place the editable frames and map them to `app/page.tsx`, `components/MRAgentChat.tsx`, and `app/pack/page.tsx`.

## Vercel And Observability

`vercel.json` disables deployments for every branch except `main`, which prevents duplicate preview deployment spam while frontend work is in progress. Production deployment still requires an explicit merge to `main` and a quota-safe release window.

Vercel Speed Insights is mounted in `app/layout.tsx`. The next observability coding task is to add structured server logs for `/api/agent` and `/api/intake`: request source, fallback path, risk state, and receipt creation result without logging raw user text.
