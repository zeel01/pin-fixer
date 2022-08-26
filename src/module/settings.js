import CONSTANTS from "./constants.js";
import "./lib/lib.js";
export const registerSettings = function () {
    game.settings.registerMenu(CONSTANTS.MODULE_NAME, 'resetAllSettings', {
        name: `${CONSTANTS.MODULE_NAME}.setting.reset.name`,
        hint: `${CONSTANTS.MODULE_NAME}.setting.reset.hint`,
        icon: 'fas fa-coins',
        type: ResetSettingsDialog,
        restricted: true,
    });
    // =====================================================================
    game.settings.register(CONSTANTS.MODULE_NAME, 'obfuscateNPCs', {
        name: `${CONSTANTS.MODULE_NAME}.setting.obfuscateNPCs.name`,
        hint: `${CONSTANTS.MODULE_NAME}.setting.obfuscateNPCs.hint`,
        type: String,
        config: true,
        scope: 'world',
        choices: {
            all: `${CONSTANTS.MODULE_NAME}.setting.obfuscateNPCs.obfuscateNPCsVisibility.all`,
            owned: `${CONSTANTS.MODULE_NAME}.setting.obfuscateNPCs.obfuscateNPCsVisibility.owned`,
            token: `${CONSTANTS.MODULE_NAME}.setting.obfuscateNPCs.obfuscateNPCsVisibility.token`,
            any: `${CONSTANTS.MODULE_NAME}.setting.obfuscateNPCs.obfuscateNPCsVisibility.any`,
        },
        default: 'all',
    });
    game.settings.register(CONSTANTS.MODULE_NAME, 'hidePortrait', {
        name: `${CONSTANTS.MODULE_NAME}.setting.hidePortrait.name`,
        hint: `${CONSTANTS.MODULE_NAME}.setting.hidePortrait.hint`,
        type: Boolean,
        config: true,
        scope: 'world',
        default: false,
    });
    game.settings.register(CONSTANTS.MODULE_NAME, 'useIntegrationWithMMM', {
        name: `${CONSTANTS.MODULE_NAME}.setting.useIntegrationWithMMM.name`,
        hint: `${CONSTANTS.MODULE_NAME}.setting.useIntegrationWithMMM.hint`,
        type: Boolean,
        config: true,
        scope: 'world',
        default: false,
    });
    // ========================================================================
    game.settings.register(CONSTANTS.MODULE_NAME, 'debug', {
        name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
        hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
        scope: 'client',
        config: true,
        default: false,
        type: Boolean,
    });
    const settings = defaultSettings();
    for (const [name, data] of Object.entries(settings)) {
        game.settings.register(CONSTANTS.MODULE_NAME, name, data);
    }
    // for (const [name, data] of Object.entries(otherSettings)) {
    //     game.settings.register(CONSTANTS.MODULE_NAME, name, data);
    // }
};
class ResetSettingsDialog extends FormApplication {
    constructor(...args) {
        //@ts-ignore
        super(...args);
        //@ts-ignore
        return new Dialog({
            title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.title`),
            content: '<p style="margin-bottom:1rem;">' +
                game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.content`) +
                '</p>',
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.confirm`),
                    callback: async () => {
                        await applyDefaultSettings();
                        window.location.reload();
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.resetsettings.cancel`),
                },
            },
            default: 'cancel',
        });
    }
    async _updateObject(event, formData) {
        // do nothing
    }
}
async function applyDefaultSettings() {
    const settings = defaultSettings(true);
    // for (const [name, data] of Object.entries(settings)) {
    //   await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
    // }
    const settings2 = otherSettings(true);
    for (const [name, data] of Object.entries(settings2)) {
        //@ts-ignore
        await game.settings.set(CONSTANTS.MODULE_NAME, name, data.default);
    }
}
function defaultSettings(apply = false) {
    return {
    //
    };
}
function otherSettings(apply = false) {
    return {
        debug: {
            name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
            hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
            scope: 'client',
            config: true,
            default: false,
            type: Boolean,
        },
    };
}
// export async function checkSystem() {
//   if (!SYSTEMS.DATA) {
//     if (game.settings.get(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown')) return;
//     await game.settings.set(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown', true);
//     return Dialog.prompt({
//       title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.nosystemfound.title`),
//       content: dialogWarning(game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.nosystemfound.content`)),
//       callback: () => {},
//     });
//   }
//   if (game.settings.get(CONSTANTS.MODULE_NAME, 'systemFound')) return;
//   game.settings.set(CONSTANTS.MODULE_NAME, 'systemFound', true);
//   if (game.settings.get(CONSTANTS.MODULE_NAME, 'systemNotFoundWarningShown')) {
//     return new Dialog({
//       title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.systemfound.title`),
//       content: warn(game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.systemfound.content`), true),
//       buttons: {
//         confirm: {
//           icon: '<i class="fas fa-check"></i>',
//           label: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.dialogs.systemfound.confirm`),
//           callback: () => {
//             applyDefaultSettings();
//           },
//         },
//         cancel: {
//           icon: '<i class="fas fa-times"></i>',
//           label: game.i18n.localize('No'),
//         },
//       },
//       default: 'cancel',
//     }).render(true);
//   }
//   return applyDefaultSettings();
// }
