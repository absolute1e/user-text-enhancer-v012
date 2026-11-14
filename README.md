# User Text Enhancer

A SillyTavern UI extension that expands and polishes the text currently in the user's message box before it is sent.

## Features

- Adds a **✦ Enhance** button beside the message composer.
- Uses the currently selected SillyTavern API/model through `generateRaw()`.
- Sends a standalone raw prompt containing the enhancement instruction and the user's draft; it does not deliberately include chat history or character-card context.
- Shows an original/enhanced preview before replacing the draft (enabled by default).
- Never sends the message automatically.
- Lets you customize the enhancement prompt and response token limit.
- Protects edits made to the message box while generation is running: an older result will not overwrite a newer draft.

## Install

In SillyTavern, open **Extensions → Install Extension**, paste this repository URL, and install:

`https://github.com/absolute1e/user-text-enhancer-for-ST`

Reload SillyTavern if the extension does not appear immediately.

## Usage

1. Write your roleplay message in the normal message box.
2. Press **✦ Enhance**.
3. Review the result and choose **Replace draft** or **Cancel**.
4. Send the message yourself when ready.

Settings are available under the **User Text Enhancer** section in Extensions.

## Compatibility

Targets SillyTavern 1.19.0 or newer. This is an initial community extension and has not been runtime-tested on every SillyTavern fork or Android build. Other installed extensions may hook into SillyTavern's raw-generation pipeline.
