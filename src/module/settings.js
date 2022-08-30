import CONSTANTS from './constants.js';
import './lib/lib.js';
export const registerSettings = function () {
  // ========================================================================
  game.settings.register(CONSTANTS.MODULE_NAME, 'debug', {
    name: `${CONSTANTS.MODULE_NAME}.setting.debug.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.debug.hint`,
    scope: 'client',
    config: true,
    default: false,
    type: Boolean,
  });
};
