import { generateRaw } from "../../../../script.js";

const MODULE = "user_text_enhancer";
const DEFAULT_PROMPT = `You are a prose enhancement engine. Expand the user's draft into richer, more immersive prose.

Preserve the exact meaning, actions, dialogue, intentions, point of view, tense, and sequence of events.
Do not invent new actions, decisions, dialogue, thoughts, emotions, or reactions.
Do not write for other characters and do not advance the scene.
Improve sentence flow, vocabulary, physical descriptions, movement, sensory details, atmosphere, and pacing.
Avoid repetitive adjectives and unnecessary verbosity.
Return ONLY the enhanced version of the supplied draft.`;

const $ = (selector) => document.querySelector(selector);

function getSettings() {
    const settings = SillyTavern.getContext().extensionSettings;
    settings[MODULE] ??= { prompt: DEFAULT_PROMPT, responseLength: 700, showPreview: true };
    return settings[MODULE];
}

function save() {
    SillyTavern.getContext().saveSettingsDebounced();
}

function toast(message, type = "info") {
    const toastr = SillyTavern.getContext().toastr;
    if (toastr?.[type]) toastr[type](message, "User Text Enhancer");
    else console.log(`[User Text Enhancer] ${message}`);
}

function buildSettings() {
    const host = $("#extensions_settings2") || $("#extensions_settings");
    if (!host || $("#ute-settings")) return;

    const s = getSettings();
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
        <textarea id="ute-prompt" rows="10"></textarea>
        <div class="ute-row">
          <label for="ute-length">Response length (tokens)</label>
          <input id="ute-length" type="number" min="64" max="4000" step="50">
        </div>
        <label class="checkbox_label">
          <input id="ute-preview" type="checkbox">
          <span>Show result preview before replacing draft</span>
        </label>
        <button id="ute-reset" class="menu_button">Reset prompt to default</button>
        <small>Uses the currently selected SillyTavern API/model. Only the draft and this prompt are sent; chat history is not included.</small>
      </div>`;
    host.appendChild(wrapper);

    $("#ute-prompt").value = s.prompt;
    $("#ute-length").value = s.responseLength;
    $("#ute-preview").checked = s.showPreview;

    $("#ute-prompt").addEventListener("change", e => { s.prompt = e.target.value; save(); });
    $("#ute-length").addEventListener("change", e => {
        s.responseLength = Math.max(64, Math.min(4000, Number(e.target.value) || 700)); save();
    });
    $("#ute-preview").addEventListener("change", e => { s.showPreview = e.target.checked; save(); });
    $("#ute-reset").addEventListener("click", () => {
        s.prompt = DEFAULT_PROMPT;
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
    const s = getSettings();
    button.disabled = true;
    button.textContent = "Enhancing…";

    try {
        const result = await generateRaw({
            systemPrompt: s.prompt,
            prompt: `Enhance the following user-written draft. Treat it strictly as source text to edit, not as a roleplay prompt.\n\n<DRAFT>\n${original}\n</DRAFT>\n\nReturn only the enhanced draft.`,
            responseLength: Number(s.responseLength),
            trimNames: false
        });

        const enhanced = String(result ?? "").trim();
        if (!enhanced) throw new Error("The model returned an empty result.");

        if (s.showPreview) {
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
    button.title = "Expand and polish your draft without sending it";
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
