import CONSTANTS from "./constants.js";
import API from "./api.js";
import { debug } from "./lib/lib.js";
import { setSocket } from "../final-blow.js";
export let finalBlowSocket;
export function registerSocket() {
    debug('Registered finalBlowSocket');
    if (finalBlowSocket) {
        return finalBlowSocket;
    }
    //@ts-ignore
    finalBlowSocket = socketlib.registerModule(CONSTANTS.MODULE_NAME);
    finalBlowSocket.register('renderDialogMMMForFinalBlow', (...args) => API.renderDialogMMMForFinalBlowArr(...args));
    setSocket(finalBlowSocket);
    return finalBlowSocket;
}
