# User Text Enhancer 0.3.2

A SillyTavern UI extension for expanding and polishing the user's own roleplay draft without taking control of other characters.

## What changed in 0.3.2

- Uses SillyTavern 1.19.0's `generateRawData()` instead of `generateRaw()`. This gives the extension the raw API response before it is reduced to a single text string.
- Uses SillyTavern's `extractMessageFromData()` to select the normal message content, and `extractReasoningFromData()` to inspect a separately returned reasoning field. A separate reasoning field is never used as the draft, even when SillyTavern's reasoning-display toggle is off.
- If the provider returns reasoning but no user-facing message content, the enhancement is rejected instead of showing the reasoning in the preview.
- Removes common explicit reasoning blocks (`<think>`, `<analysis>`, and related formats), unwraps tagged final-answer blocks, and extracts a labeled final section where present.
- Adds a conservative visible-analysis guard for common English, Russian, and Chinese planning preambles. Recognizable analysis-only output is rejected instead of being placed in the preview.
- Removes the 0.3.1 attempt to inject `thinking: { type: disabled }` into a Custom endpoint's request body. That guessed provider parameter caused an error on the tested LoreBary connection and is no longer sent.
- Keeps the native DeepSeek Thinking switch limited to SillyTavern's built-in DeepSeek connection. For a matching LoreBary DeepSeek Custom endpoint, an optional `<THINKINGLEVEL=LOW>` command requests lower reasoning effort; it is not an OFF switch and cannot guarantee that the provider stops reasoning.

## What changed in 0.3.0

- Uses role-preserved Chat Completion messages. Recent messages keep their `user` / `assistant` roles instead of being flattened into one text block; the system instruction identifies them as historical context, not new requests.
- Builds reference context from the active character card, current persona, scenario, creator notes, example dialogue, and active World Info.
- Scans World Info with SillyTavern's `getWorldInfoPrompt(..., true, ...)` dry-run path.
- Adds Rich Novel, Balanced, and Natural writing modes. Rich Novel is the default.
- Makes the other-character ownership boundary explicit: no new actions, dialogue, thoughts, emotions, reactions, sounds, or physiological responses for other characters.
- Adds an optional second-pass ownership check (enabled by default; costs one extra model request).
- Adds a context preview so you can confirm which context sources were collected before spending tokens.
- Protects `{{...}}` template placeholders from SillyTavern macro substitution during generation, then restores them before preview.
- Keeps the original / enhanced review flow. Replacing the input never sends the message.
- Protects against chat switching or edits to the composer while generation is running.

## Requirements

- SillyTavern 1.19.0 or newer.
- The active SillyTavern model connection must support text generation. Chat Completion is recommended for role-preserved context and raw response extraction.

## Installation / update

1. Back up or copy the current extension folder if you want to keep the previous version.
2. Replace the contents of your existing `user-text-enhancer-v012` GitHub repository with the contents of this release folder (`index.js`, `manifest.json`, `style.css`, `README.md`, and `LICENSE`, keeping them at the repository root).
3. Commit the changes to the repository's `main` branch.
4. In SillyTavern, update/reinstall the extension from the same repository URL. If ST reports that the destination directory already exists, use the existing extension's update mechanism or remove the old extension entry before reinstalling; do not install a second copy under a different name unless you intend to keep both.
5. Reload the SillyTavern page/app.

The manifest keeps `auto_update` disabled. The `homePage` points to `https://github.com/absolute1e/user-text-enhancer-v012`.

## Settings

- **Rich Novel**: detailed prose expansion, with a soft target of 4–8 sentences for short drafts when the source material supports it.
- **Balanced**: moderate expansion.
- **Natural**: lighter editing.
- **Response length**: maximum output tokens used by SillyTavern's active connection.
- **Recent chat messages**: number of recent messages supplied as role-preserved context.
- **Context sources**: toggles for chat history, character card, persona, active lorebook, and example dialogue. Example dialogue is off by default because card examples can contain the other character's voice.
- **Preview active context**: shows what was collected before generating.
- **Second-pass ownership check**: asks the selected model to compare the candidate with the original draft and remove unauthorized additions. This sends a second API request.
- **Disable Thinking on SillyTavern's native DeepSeek connection only**: temporarily changes `show_thoughts` for SillyTavern's built-in DeepSeek source. It does not alter a Custom endpoint's request body.
- **Request LOW reasoning effort on LoreBary DeepSeek**: prepends LoreBary's documented `<THINKINGLEVEL=LOW>` command to the first system message only when the Custom URL matches `api.lorebary.com/deepseek`. This is an effort request, not a guaranteed reasoning-off control. It can be switched off.
- **Show result preview**: compare original and enhanced text before replacing the composer.
- **Additional prompt guidance / style preferences**: optional preferences subordinate to the hard ownership rules. The core ownership rules are immutable in the code.

## Output-protection behavior and limits

The extension reads the raw response and separates normal message content from provider reasoning when the response format exposes both fields. Only message content is eligible for the preview. If the response contains a separate reasoning field but no message content, the run fails safely.

Some gateways may put internal reasoning directly into the ordinary `message.content` field instead of returning a separate reasoning field. The extension removes common tagged formats and rejects recognizable analysis-only preambles. This text-based check is necessarily heuristic: it cannot identify every possible untagged reasoning passage without also risking false positives on ordinary roleplay prose. The extension does not claim to disable private model reasoning on LoreBary; its LOW command only requests lower effort on supported routes.

## Important behavior

- Only the text in the message composer is enhanced. The draft is not added to chat history before generation.
- The active character/persona/lorebook and recent conversation are reference material, not instructions to continue the roleplay.
- Another character's action may be elaborated only if that action is already explicitly present in the user's draft. The extension must not invent their next reaction or response.
- The result is never auto-sent. The user must explicitly choose to replace the draft.
- The extension uses the currently selected SillyTavern API/model. It does not store API keys.

## Compatibility note

This release relies on exports present in SillyTavern 1.19.0: `generateRawData`, `extractMessageFromData`, `cleanUpMessage`, and `extractReasoningFromData`. Internal module paths and APIs can change in future SillyTavern releases.
