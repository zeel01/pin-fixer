import { setApi } from '../main.js';
import './api.js';
import API from './api.js';
import CONSTANTS from './constants.js';
import { warn } from './lib/lib.js';
import { PinFixer } from './pin-fixer.js';

export const initHooks = (...args) => {
  warn('Init Hooks processing');

  PinFixer.init(...args);
};
export const setupHooks = () => {
  warn('Setup Hooks processing');
  setApi(API);
};
export const readyHooks = async () => {
  warn('Ready Hooks processing');
  PinFixer.pullAboveFog();
  Hooks.on('renderSceneControls', (...args) => {
    PinFixer.renderSceneControls(...args);
  });

  Hooks.on('canvasPan', (...args) => {
    PinFixer.canvasPan(...args);
  });
  Hooks.on('renderSceneConfig', (...args) => {
    PinFixer.renderSceneConfig(...args);
  });
  Hooks.on('renderNoteConfig', (...args) => {
    PinFixer.renderNoteConfig(...args);
  });
  Hooks.on('hoverNote', (...args) => {
    PinFixer.hoverNote(...args);
  });

  Hooks.on('updateNote', (...args) => {
    PinFixer.updateNote(...args);
  });
  Hooks.on('updateScene', (...args) => {
    PinFixer.updateScene(...args);
  });

  PinFixer.createHudHooks();

  // eslint-disable-next-line no-undef
  libWrapper.register(CONSTANTS.MODULE_NAME, 'Note.prototype._canDrag', NotePrototypeCanDragHandler, 'MIXED');
};

/**
 * This scetion is a money-patch of Note#_canDrag()
 * by making thie method return false dragging can be prevented.
 *
 * This patched method returns false either when
 * the user has insufficient permissions, or
 * when the pin locking feature is enabled.
 * This prevents pins from being moved in
 * unwanted contexts.
 *
 * @param {User} user - The current user
 * @param {Event} event - The precipitating event
 * @return {boolean} Whether or not dragging the note is permitted for the user on this layer
 * @memberof Note
 */
export const NotePrototypeCanDragHandler = async function (wrapped, ...args) {
  if (PinFixer.lockPins) {
    return false;
  } else {
    // When lockPins isn't true, return the result of the original method
    // return PinFixer.noteCanDrag.bind(this)(user, event);
    return wrapped(...args);
  }
};
