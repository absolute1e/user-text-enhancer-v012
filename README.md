# User Text Enhancer 0.2.1

A SillyTavern UI extension that improves the user's unsent roleplay draft without adding it to chat history or auto-sending it.

## What changed in 0.2.1

- Uses `generateRaw()` with a dedicated editor system prompt instead of asking SillyTavern to continue a quiet in-chat generation.
- Collects active character-card fields, the selected persona, recent chat messages, active extension prompt notes, and a dry-run activation of World Info as reference material.
- Adds the unsent draft to the World Info dry-run scan only to activate relevant entries. It does not add the draft to `context.chat`.
- Preserves the original point of view and forbids new actions, reactions, thoughts, or dialogue for other characters.
- Checks for obvious first-person-to-third-person POV changes, a suspicious increase in third-person character references, and additional dialogue blocks. A failed result is retried once; if it still fails, the draft remains unchanged.
- Keeps preview-before-replacement enabled by default.

## Install / update

Repository: https://github.com/absolute1e/user-text-enhancer-v012

After replacing the repository files, update/reinstall the extension from that repository and restart/reload SillyTavern. Existing customized prompts are preserved; exact legacy default prompts are migrated to the 0.2.1 default.

## Compatibility

Targeted at SillyTavern 1.19.0. The extension uses the 1.19.0 context API (`getContext`, `getCharacterCardFields`, `getWorldInfoPrompt`, and `generateRaw`).

## Important limitation

The output validator is heuristic, not a semantic guarantee. It catches obvious POV switches, suspicious third-person character expansion, and added dialogue, but a model can still invent a non-dialogue action while staying in first person. Preview remains enabled so the user can inspect every result before replacing the draft.
