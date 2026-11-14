# User Text Enhancer for SillyTavern

A draft enhancer for SillyTavern 1.19.0+. It rewrites the text in the message input and shows a preview before replacing it. It never sends the message automatically.

## Context-aware mode

When **Use active chat context** is enabled, the extension uses SillyTavern's `generateQuietPrompt()` instead of raw generation. The request is built inside the active chat and can therefore use the same configured character card, persona, chat history, World Info/lorebook entries, Author's Note, and prompt-manager context that are active for the current chat.

The extension appends a draft-enhancement instruction as a quiet prompt. The draft is not inserted into the chat and is not saved to history. `responseLength` is applied only to that quiet generation request and restored by SillyTavern afterward.

The default prompt is designed to expand the user's side of the roleplay only. It explicitly prohibits writing new actions, dialogue, reactions, thoughts, or decisions for AI-controlled characters. It allows elaboration of another character's action only when the user's draft already states that action.

## Settings

- **Enhancement prompt** — editable instruction used for the rewrite.
- **Response length** — maximum response length for the enhancement request.
- **Use active chat context** — on: use quiet generation in the current chat; off: use the legacy raw-generation path with only the draft and prompt.
- **Show result preview** — preview the original and enhanced text before replacing the draft.

## Install / update

Install this repository through SillyTavern's **Extensions → Install Extension** using the Git URL:

`https://github.com/absolute1e/user-text-enhancer-for-ST`

For an existing installation, replace the repository files with this version and reload SillyTavern. The manifest version is `0.2.0`.
