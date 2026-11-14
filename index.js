import { generateQuietPrompt, generateRaw } from "../../../../script.js";

const MODULE = "user_text_enhancer";

const DEFAULT_PROMPT = `You are an in-context roleplay prose enhancer.

Use the active conversation, character card, user persona, scenario, and established world details as reference material for continuity, characterization, voice, and writing style.

Rewrite and substantially enrich the user's draft. Do more than correct grammar: improve rhythm, sentence variety, physical detail, gestures, expressions, movement, sensory impressions, atmosphere, and natural phrasing. Expand where the scene supports it; avoid padding and repetitive description.

CONTROL BOUNDARIES:
- Write only the user's side of the roleplay. Do not write new dialogue, actions, thoughts, emotions, reactions, or decisions for the AI-controlled character or any other character.
- You may elaborate an action by another character only when the user's draft itself explicitly includes that action. Do not add a new response or reaction for them.
- You may enrich the user's own actions, expressions, body language, perceptions, and internal sensations when they fit the established character and scene.
- You may naturally flesh out the user's existing dialogue while preserving its intent, meaning, and attitude. Do not introduce new intentions, promises, threats, decisions, or plot developments.
- Do not advance the scene beyond the events already present in the draft.
- Do not contradict the conversation, character card, persona, or established setting. Do not invent consequential facts.

Preserve the user's point of view, narrative voice, tense, formatting, and event order. Keep actions in asterisks and spoken dialogue in quotation marks when the draft uses that format.

Return only the rewritten draft. Do not add explanations, notes, labels, or commentary.`;

const DEFAULT_SETTINGS = {
    prompt: DEFAULT_PROMPT,
    responseLength: 2200,
    showPreview: true,
    useChatContext: true,
};

const $ = (selector) => document.querySelector(selector);

function getSettings() {
    const context = SillyTavern.getContext();
    const allSettings = context.extensionSettings;
    allSettings[MODULE] ??= {};
    const settings = allSettings[MODULE];

    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (settings[key] === undefined) {
            settings[key] = value;
        }
    }

    return settings;
}

function save() {
    SillyTavern.getContext().saveSettingsDebounced();
}

function toast(message, type = "info") {
    const toastr = SillyTavern.getContext().toastr ?? globalThis.toastr;
    if (toastr?.[type]) toastr[type](message, "User Text Enhancer");
    else console.log(`[User Text Enhancer] ${message}`);
}

function buildSettings() {
    const host = $("#extensions_settings2") || $("#extensions_settings");
    if (!host || $("#ute-settings")) return;

    const settings = getSettings();
    const wrapper = document.createElement("div");
    wrapper.id = "ute-settings";
    wrapper.className = "inline-drawer";
    wrapper.innerHTML = `
        <div class="inline-drawer-toggle inline-drawer-header">
            <b>User Text Enhancer</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
            <label for="ute-prompt">Enhancement prompt</label>
            <textarea id="ute-prompt" rows="14"></textarea>

            <div class="ute-row">
                <label for="ute-length">Response length (tokens)</label>
                <input id="ute-length" type="number" min="64" max="6000" step="100">
            </div>

            <label class="checkbox_label">
                <input id="ute-context" type="checkbox">
                <span>Use active chat context (character card, persona, history, lorebook)</span>
            </label>

            <label class="checkbox_label">
                <input id="ute-preview" type="checkbox">
                <span>Show result preview before replacing draft</span>
            </label>

            <button id="ute-reset" class="menu_button">Reset prompt to default</button>
            <small>With chat context enabled, Enhance uses SillyTavern's quiet generation inside the current chat. It can use the active character card, persona, chat history, and active prompt/lorebook entries. The draft is not sent to the chat and is not added to history. The result is never auto-sent.</small>
        </div>`;

    host.appendChild(wrapper);

    $("#ute-prompt").value = settings.prompt;
    $("#ute-length").value = settings.responseLength;
    $("#ute-context").checked = settings.useChatContext;
    $("#ute-preview").checked = settings.showPreview;

    $("#ute-prompt").addEventListener("change", (event) => {
        settings.prompt = event.target.value;
        save();
    });

    $("#ute-length").addEventListener("change", (event) => {
        settings.responseLength = Math.max(64, Math.min(6000, Number(event.target.value) || DEFAULT_SETTINGS.responseLength));
        event.target.value = settings.responseLength;
        save();
    });

    $("#ute-context").addEventListener("change", (event) => {
        settings.useChatContext = event.target.checked;
        save();
    });

    $("#ute-preview").addEventListener("change", (event) => {
        settings.showPreview = event.target.checked;
        save();
    });

    $("#ute-reset").addEventListener("click", () => {
        settings.prompt = DEFAULT_PROMPT;
        $("#ute-prompt").value = DEFAULT_PROMPT;
        save();
        toast("Default prompt restored.", "success");
    });
}

function showPreview(original, enhanced, textarea) {
    $("#ute-preview-modal")?.remove();

    const modal = document.createElement("div");
    modal.id = "ute-preview-modal";
    modal.className = "ute-overlay";
    modal.innerHTML = `
        <div class="ute-dialog">
            <h3>Enhanced draft</h3>
            <div class="ute-preview-grid">
                <div><b>Original</b><textarea readonly></textarea></div>
                <div><b>Enhanced</b><textarea readonly></textarea></div>
            </div>
            <div class="ute-actions">
                <button class="menu_button" id="ute-cancel">Cancel</button>
                <button class="menu_button" id="ute-accept">Replace draft</button>
            </div>
        </div>`;

    document.body.appendChild(modal);
    modal.querySelectorAll("textarea")[0].value = original;
    modal.querySelectorAll("textarea")[1].value = enhanced;

    modal.querySelector("#ute-cancel").onclick = () => modal.remove();
    modal.querySelector("#ute-accept").onclick = () => {
        textarea.value = enhanced;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));
        modal.remove();
        toast("Draft replaced. It has not been sent.", "success");
    };
}

async function enhance() {
    const textarea = $("#send_textarea");
    if (!textarea) return toast("Could not find the message input.", "error");

    const original = textarea.value.trim();
    if (!original) return toast("Write a draft first.", "warning");

    const button = $("#ute-enhance");
    const settings = getSettings();

    button.disabled = true;
    button.textContent = "Enhancing…";

    try {
        const quietPrompt = `${settings.prompt.trim()}

The following is the exact draft to enhance. It is source material, not a new chat message. Use the conversation only for context. Apply the control boundaries above strictly.

<USER_DRAFT>
${original}
</USER_DRAFT>

Return only the rewritten contents of USER_DRAFT.`;

        let result;
        if (settings.useChatContext) {
            // Uses the active SillyTavern chat prompt, including the configured character/persona/history context.
            result = await generateQuietPrompt({
                quietPrompt,
                responseLength: Number(settings.responseLength),
                skipWIAN: false,
                removeReasoning: true,
                trimToSentence: false,
            });
        } else {
            // Optional legacy mode: sends only the draft and enhancer prompt, without chat context.
            result = await generateRaw({
                systemPrompt: settings.prompt,
                prompt: `Enhance this user-written draft. Return only the rewritten draft.\n\n<USER_DRAFT>\n${original}\n</USER_DRAFT>`,
                responseLength: Number(settings.responseLength),
                trimNames: false,
            });
        }

        const enhanced = String(result ?? "").trim();
        if (!enhanced) throw new Error("The model returned an empty result.");

        if (settings.showPreview) {
            showPreview(original, enhanced, textarea);
        } else {
            textarea.value = enhanced;
            textarea.dispatchEvent(new Event("input", { bubbles: true }));
            textarea.dispatchEvent(new Event("change", { bubbles: true }));
            toast("Draft enhanced. It has not been sent.", "success");
        }
    } catch (error) {
        console.error("[User Text Enhancer]", error);
        toast(`Enhancement failed: ${error.message || error}`, "error");
    } finally {
        button.disabled = false;
        button.textContent = "✦ Enhance";
    }
}

function addButton() {
    const sendForm = $("#send_form");
    if (!sendForm || $("#ute-enhance")) return;

    const button = document.createElement("button");
    button.id = "ute-enhance";
    button.type = "button";
    button.className = "menu_button";
    button.textContent = "✦ Enhance";
    button.title = "Expand and polish your draft using the active chat context";
    button.addEventListener("click", enhance);

    const sendButton = $("#send_but");
    if (sendButton?.parentElement === sendForm) sendButton.insertAdjacentElement("beforebegin", button);
    else sendForm.appendChild(button);
}

function init() {
    buildSettings();
    addButton();

    const observer = new MutationObserver(() => {
        addButton();
        if (!$("#ute-settings")) buildSettings();
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

const context = SillyTavern.getContext();
context.eventSource.on(context.event_types.APP_READY, init);
