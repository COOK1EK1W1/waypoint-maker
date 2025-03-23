import { mavCmds } from "./mavCommands";
import { wpmCmds } from "./wpmCommands";

export const commands = [...mavCmds, ...wpmCmds]
