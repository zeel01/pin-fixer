import CONSTANTS from './constants.js';
import API from './api.js';
import { debug } from './lib/lib.js';
import { setSocket } from '../main.js';

export let pinFixerSocket;

export function registerSocket() {
  debug('Registered pinFixerSocket');
  if (pinFixerSocket) {
    return pinFixerSocket;
  }
  //@ts-ignore
  pinFixerSocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);
  // pinFixerSocket.register('renderDialogMMMForFinalBlow', (...args) => API.renderDialogMMMForFinalBlowArr(...args));
  setSocket(pinFixerSocket);
  return pinFixerSocket;
}
