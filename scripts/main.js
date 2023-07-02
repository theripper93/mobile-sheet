import {initConfig} from "./config.js";
import { registerSettings } from "./settings.js";

export const MODULE_ID = "mobile-sheet";

Hooks.on("init", () => {
    initConfig();
    registerSettings();
    const oldClickLeft = Sidebar.prototype._onLeftClickTab;
    Sidebar.prototype._onLeftClickTab = function (event) {
        if(!game.user.flags[MODULE_ID]?.mobileMode) return oldClickLeft.bind(this)(event);
        const app = ui[event.currentTarget.dataset.tab];
        if (app && this._collapsed) ui.sidebar.expand();
        if(ui.sidebar.activeTab === event.currentTarget.dataset.tab) ui.sidebar.collapse();
    }
});

Hooks.on("ready", () => {
    const user = game.user;
    const isGM = user.isGM;
    if (isGM || !user.getFlag(MODULE_ID, "mobileMode")) return game.settings.set("core", "noCanvas", false);
    const assignedCharacter = user.character;
    if (!assignedCharacter) return;
    //disable canvas
    game.settings.set("core", "noCanvas", true);

    document.querySelector("#ui-left").classList.add("mobile-sheet-hidden");
    document.querySelector("#ui-middle").classList.add("mobile-sheet-hidden");
    document.querySelector("#ui-right").classList.add("mobile-sheet-ui-right");
    document.querySelector("#interface").classList.add("mobile-sheet-interface");

    assignedCharacter.sheet.render(true);

    Hooks.on("renderActorSheet", (app, html, data) => {
        const appWindow = app.element[0].closest(".app");
        appWindow.classList.add("mobile-sheet-app");
        appWindow.querySelector("header").classList.add("mobile-sheet-hidden");
        const resizeHandle = appWindow.querySelector(".window-resizable-handle");
        resizeHandle.classList.add("mobile-sheet-hidden");
        document.body.classList.add("mobile-sheet-body");

        ui.sidebar.collapse();

        const scaleToFit = () => {
            const sheet = appWindow;
            //first, reset the scale
            sheet.style.transform = "scale(1)";

            const sheetHeight = sheet.offsetHeight;
            const sheetWidth = sheet.offsetWidth;
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const scale = Math.min(windowHeight / sheetHeight, windowWidth / sheetWidth);
            sheet.style.transform = `scale(${scale})`;
            const pr = `${parseInt(35/scale)}px`;
            sheet.querySelector(".window-content").style.paddingRight = pr
            sheet.style.transformOrigin = "top left";
            //set the height and width to fill the screen
            const newHeight = sheetHeight * scale;
            const newWidth = sheetWidth * scale;
            if (newHeight < windowHeight) {
                const factor = windowHeight / newHeight;
                sheet.style.minHeight = `${100 * factor}vh`;
            }
            if (newWidth < windowWidth) {
                const factor = windowWidth / newWidth;
                sheet.style.minWidth = `${100 * factor}vw`;
            }
        };

        scaleToFit();

        //wrap setPosition
        if (!app.setPositionWrapped) {            
            const setPosition = app.setPosition;
            app.setPosition = function (...args) {
                setPosition.bind(app)(...args);
                scaleToFit();
                setTimeout(() => {
                    scaleToFit();
                }, 100);
            };
            app.setPositionWrapped = true;
        }

    });
})