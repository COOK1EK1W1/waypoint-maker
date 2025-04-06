import { Command, CommandName, CommandParams, commands, CommandValue, ICommand } from "./commands";

export function makeCommand<T extends CommandName>(name: T, params: { [K in keyof CommandParams<T>]?: number }): ICommand<T> {

  let newParams = {}
  let a = commands.find((x) => x.name == name)
  a?.parameters.forEach((x) => {
    if (x === null) { return }
    //@ts-ignore
    if (params[x.label.toLowerCase()]) {
      //@ts-ignore
      newParams[x.label.toLowerCase()] = params[x.label.toLowerCase()]
    } else {
      //@ts-ignore
      newParams[x.label.toLowerCase()] = 0

    }
  })


  return {
    //@ts-ignore
    type: commands.find((x) => x.name == name).value as ICommand<T>["type"],
    frame: 3,
    params: newParams as CommandParams<T>,
    autocontinue: 0
  }
}
