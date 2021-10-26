import { useRouter } from 'next/router'

import { ApiDevice } from '../lib/types'
import { elapsedTime, formatIP } from '../lib/utils'

export default function DeviceTable(props: ApiDevice[]) {
  let basestations = []
  let relays = []
  for (let i in props) {
    switch (props[i].type) {
      case "BASESTATION":
        basestations.push(<DeviceRow {...props[i]}></DeviceRow>)
        break;
      case "RELAY":
        relays.push(<DeviceRow {...props[i]}></DeviceRow>)
        break;
      default:
        console.log("Unknown device type:", props[i])
    }
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>MAC</th>
          <th>Deployment</th>
          <th>ID</th>
          <th>IP Address</th>
          <th>Last Seen</th>
        </tr>
      </thead>
      <tbody>
        {basestations}
        {relays}
      </tbody>
    </table>
  )
  //data: ApiData
}

function DeviceRow(dev: ApiDevice) {
  const router = useRouter()
  //console.log(dev)
  let type = dev.type == "BASESTATION" ? "BS" : dev.type;
  let name = dev.nickname ? dev.nickname : type + " " + dev.mac.substring(6,12)
  let deployment = dev.deployment ? dev.deployment : "-"
  let relay_id = dev.relay_id ? dev.relay_id.toString() : "-"
  if (dev.relay_id == 0) {
    relay_id = "BS"
  }
  return (
      <tr onClick={() => router.push(`/device?mac=${dev.mac}`)}>
      <td><a>{name}</a></td>
      <td><a>{dev.mac}</a></td>
      <td><a>{deployment}</a></td>
      <td><a>{relay_id}</a></td>
      <td><a>{formatIP(dev.addr)}</a></td>
      <td><a>{elapsedTime(dev.last_seen)}</a></td>
    </tr>
  )
}
