const { writeFile } = require("fs");
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// export const commandTypes = [
//   { value: 16, name: "Waypoint", MAV: "MAV_CMD_NAV_WAYPOINT", parameters: [{}, {}, {}, {}, {}, {}, {}] },
//   { value: 17, name: "Loiter Unlimited", MAV: "MAV_CMD_NAV_LOITER_UNLIM" },
//   { value: 18, name: "Loiter Turns", MAV: "MAN_CMD_NAV_LOITER_TURNS" },
//   { value: 20, name: "Return To Launch", MAV: "MAV_CMD_NAV_RETURN_TO_LAUNCH" },
//   { value: 21, name: "Land", MAV: "MAV_CMD_NAV_LAND" },
//   { value: 22, name: "Takeoff", MAV: "MAV_CMD_TAKEOFF" }
// ]


function serializeObject(obj) {
  let serialized = '{\n';
  for (const [key, value] of Object.entries(obj)) {
    serialized += `  ${key}: ${serializeValue(value)},\n`;
  }
  serialized += '}';
  return serialized;
}

function serializeValue(value) {
  if (typeof value === 'object' && value !== null) {
    if (Array.isArray(value)) {
      return `[${value.map(v => serializeValue(v)).join(', ')}]`;
    } else {
      return serializeObject(value);
    }
  }
  // For non-objects (and null), JSON.stringify is fine
  return JSON.stringify(value);
}

function serializeToTypeScript(object) {
  const serializedObject = serializeValue(object);
  return `export const commands: Command[] = ${serializedObject};\n`;
}

async function getData() {
  const response = await fetch("https://raw.githubusercontent.com/ArduPilot/mavlink/master/message_definitions/v1.0/common.xml")
  const data = await response.text()
  const xmlDoc = new JSDOM(data, { contentType: "text/xml", features: { QuerySelector: true } })

  const enums = xmlDoc.window.document.querySelectorAll('enum[name="MAV_CMD"]');
  const elements = enums[0].getElementsByTagName('entry');
  const commands = Array.from(elements)

  const completedCommands = commands.map((command) => {
    let newCommand = {
      value: Number(command.getAttribute("value")),
      name: command.getAttribute("name"),
      description: "",
      hasLocation: command.getAttribute("hasLocation") === "true",
      isDestination: command.getAttribute("isDestination") === "true",
      parameters: [null, null, null, null, null, null, null]
    }

    const params = Array.from(command.children)

    for (param of params) {
      if (param.tagName == "param") {
        const attributes = param.getAttributeNames()

        let newParameter = {
          index: -1,
          label: "",
          description: param.innerHTML,
          units: "",
          minValue: null,
          maxValue: null,
          increment: null,
          default: null,
          options: []
        }
        for (let i = 0; i < attributes.length; i++) {
          if (attributes[i] === "index") {
            newParameter.index = Number(param.getAttribute(attributes[i]))

          } else if (attributes[i] === "label") {
            newParameter.label = param.getAttribute(attributes[i])
          } else if (attributes[i] === "units") {
            newParameter.units = param.getAttribute(attributes[i])
          } else if (attributes[i] === "minValue") {
            newParameter.minValue = Number(param.getAttribute(attributes[i]))
          } else if (attributes[i] === "increment") {
            newParameter.increment = Number(param.getAttribute(attributes[i]))
          } else if (attributes[i] === "maxValue") {
            newParameter.maxValue = Number(param.getAttribute(attributes[i]))
          } else if (attributes[i] === "default") {
            newParameter.default = Number(param.getAttribute(attributes[i]))
          } else if (attributes[i] === "enum") {
            console.log("TODO enum options")
            // newParameter.options == child.getAttribute(attributes[i])
          } else {
            console.log(attributes[i])
          }

        }
        if (param.innerHTML != "Empty" && param.innerHTML != "Empty.") {
          newCommand.parameters[newParameter.index - 1] = newParameter
        }
      } else if (param.tagName == "description") {

        newCommand.description = param.innerHTML
      }
    }
    return newCommand
  })
  writeFile("src/util/commands.ts", serializeToTypeScript(completedCommands), (a) => { console.log(a) })
}

getData()