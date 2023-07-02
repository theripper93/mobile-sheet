import { MODULE_ID } from "./main.js";

export function initConfig() {
    Hooks.on("renderUserConfig", (app, html, user) => {
        const isMobileMode = app.object.getFlag(MODULE_ID, "mobileMode");
        const mobileModeHtml = `<div class="form-group">
        <label>${game.i18n.localize(`${MODULE_ID}.mobileMode`)}</label>
        <input type="checkbox" name="flags.${MODULE_ID}.mobileMode" ${isMobileMode ? `checked=""` : ""}>
        <p class="hint">${game.i18n.localize(`${MODULE_ID}.mobileModeHint`)}</p>
        </div>`
        html[0].querySelector(`input[name="pronouns"]`).closest(".form-group").insertAdjacentHTML("afterend", mobileModeHtml);
        app.setPosition({ height: "auto" });
    });
}