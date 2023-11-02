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

async function getData() {
  const response = await fetch("https://raw.githubusercontent.com/ArduPilot/mavlink/master/message_definitions/v1.0/common.xml")
  const data = await response.text()
  const xmlDoc = new JSDOM(data, { contentType: "text/xml", features: { QuerySelector: true } })
  // const json = convert.xml2js(data, { compact: true, spaces: 4 });
  // console.log(json.mavlink.enums.enum.filter((a) => a._attributes.name = "MAV_CMD"))
  // return

  // Check for errors
  const enums = xmlDoc.window.document.querySelectorAll('enum[name="MAV_CMD"]');
  const elements = enums[0].getElementsByTagName('entry');
  console.log(elements.length)
  const commands = Array.from(elements).slice(0, 10)
  commands.map((command) => {
    console.log(command.attributes.getNamedItem("name").value)

    const children = Array.from(command.children)
    children.map((child) => {
      console.log(child.innerHTML)
    })
  })
  // const output = elements.map((element) => {
  //   console.log(element)
  // })
}

getData()