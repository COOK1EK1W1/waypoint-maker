import { Command, CommandName, CommandParams, CommandParamsNames, commands, ICommand } from "./commands";

/*
 * Construct a default command, or specify some parameters to apply
 * @param {T} name - The command name
 * @param {[K in keyof CommandParams<T>]?: number} params - An object containing key/value params for the command
 * @returns {ICommand<T>} The new command
 */
export function makeCommand<T extends CommandName>(name: T, params: { [K in keyof CommandParams<T>]?: number }): ICommand<T> {
  const newParams: Record<string, number> = {}
  const cmd = commands.find((cmd) => cmd.name == name)

  cmd?.parameters.forEach((param) => {
    if (param === null) { return }
    const paramKey = param.label.toLowerCase()
    if (paramKey in params) {
      newParams[paramKey] = params[paramKey as keyof typeof params] ?? 0
    } else {
      newParams[paramKey] = param.default ?? 0
    }
  })

  const params2 = newParams as CommandParams<T>

  return {
    type: cmd?.value as ICommand<T>["type"],
    // @ts-ignore
    frame: "altitude" in params2 ? 3 : 2,
    params: params2,
    autocontinue: 0
  }
}
