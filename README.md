# User Text Enhancer 0.3.1

A SillyTavern UI extension for expanding and polishing the user's own roleplay draft without taking control of other characters.

## What changed in 0.3.1

- Adds a DeepSeek Thinking override for Enhance requests. On SillyTavern's native DeepSeek connection it temporarily disables `show_thoughts`, which maps to DeepSeek `thinking.type: disabled`. On a detected Custom DeepSeek/LoreBary-compatible endpoint, it temporarily adds `thinking: { type: disabled }` through Custom Include Body and restores the previous setting after generation. The endpoint must support this provider-specific parameter; LoreBary compatibility still needs a live test.
- Removes explicit `<think>`, `<analysis>`, `<reasoning>`, and related tagged blocks from returned text. It can extract a labeled final draft after a reasoning preamble, remove harmless lead-ins, and rejects obvious visible analysis instead of replacing the composer with it.
- Adds a setting to turn the provider-level override off. The override is temporary and is not saved into the user's connection settings.

## What changed in 0.3.0

- Uses `generateRaw()` with a Chat Completion message array. Recent chat messages keep their `user` / `assistant` roles instead of being flattened into one text block; the system instruction explicitly identifies them as historical context, not new requests.
- Builds reference context from the active character card, current persona, scenario, creator notes, example dialogue, and active World Info.
- Scans World Info with SillyTavern's `getWorldInfoPrompt(..., true, ...)` dry-run path. This follows ST activation rules and avoids the normal `WORLD_INFO_ACTIVATED` event.
- Adds Rich Novel, Balanced, and Natural writing modes. Rich Novel is the default.
- Makes the other-character ownership boundary explicit: no new actions, dialogue, thoughts, emotions, reactions, sounds, or physiological responses for other characters.
- Adds an optional second-pass ownership check (enabled by default; costs one extra model request). The audit receives the character/persona/lorebook reference data so it can retain established descriptive details without treating them as permission to invent events.
- Adds a context preview so you can confirm which context sources were collected before spending tokens.
- Protects `{{...}}` template placeholders from SillyTavern macro substitution during generation, then restores them before preview.
- Keeps the original / enhanced review flow. Replacing the input never sends the message.
- Protects against chat switching or edits to the composer while generation is running.

## Requirements

- SillyTavern 1.19.0 or newer.
- The active SillyTavern model connection must support text generation. For the role-preserving message array, Chat Completion is recommended.

## Installation / update

1. Back up or copy the current extension folder if you want to keep the previous version.
2. Replace the contents of your existing `user-text-enhancer-v012` GitHub repository with the contents of this release folder (`index.js`, `manifest.json`, `style.css`, and `README.md`).
3. Commit the changes to the repository's `main` branch.
4. In SillyTavern, update/reinstall the extension from the same repository URL. If ST reports that the destination directory already exists, use the existing extension's update mechanism or remove the old extension entry before reinstalling; do not install a second copy under a different name unless you intend to keep both.
5. Reload the SillyTavern page/app.

The manifest keeps `auto_update` disabled to match the existing repository setup. The extension's `homePage` points to `https://github.com/absolute1e/user-text-enhancer-v012`.

## Settings

- **Rich Novel**: detailed prose expansion, with a soft target of 4–8 sentences for short drafts when the source material supports it.
- **Balanced**: moderate expansion.
- **Natural**: lighter editing.
- **Response length**: maximum output tokens used by SillyTavern's active connection.
- **Recent chat messages**: number of most recent messages supplied as role-preserved context.
- **Context sources**: toggles for chat history, character card, persona, active lorebook, and example dialogue. Example dialogue is off by default because card examples can contain the other character's voice and are not necessary for user-side prose.
- **Preview active context**: shows what was collected before generating.
- **Second-pass ownership check**: asks the selected model to compare the candidate with the original draft and remove unauthorized additions. This sends a second API request.
- **Disable DeepSeek Thinking during Enhance**: enabled by default. For native DeepSeek, ST's `show_thoughts` value is temporarily set to false. For a Custom endpoint identified as DeepSeek or LoreBary DeepSeek, a temporary `thinking: { type: disabled }` block is inserted into Custom Include Body. The original setting is restored after both generation passes. Some third-party compatible gateways may ignore or reject DeepSeek-specific fields; this extension cannot guarantee support without a live provider test.
- **Reasoning output guard**: removes common tagged reasoning blocks and refuses to use an obvious analysis-only response. `generateRaw()` returns message content; the extension cannot access or suppress a provider-private reasoning field unless the provider exposes a documented request parameter.
- **Show result preview**: compare original and enhanced text before replacing the composer.
- **Additional prompt guidance / style preferences**: optional preferences subordinate to the hard ownership rules. The core ownership rules are immutable in the code and cannot be removed through the settings text fields.

## Important behavior

- Only the text in the message composer is enhanced. The draft is not added to chat history before generation.
- The active character/persona/lorebook and recent conversation are reference material, not instructions to continue the roleplay.
- Another character's action may be elaborated only if that action is already explicitly present in the user's draft. The extension must not invent their next reaction or response.
- The result is never auto-sent.
- The extension uses the currently selected SillyTavern API/model. It does not store API keys.

## Compatibility note

This release uses the SillyTavern 1.19.0 `generateRaw` API and imports `getWorldInfoPrompt` from the 1.19.0 World Info module. SillyTavern internal module paths can change between releases; if a future ST update changes those APIs, this extension may need an update.
