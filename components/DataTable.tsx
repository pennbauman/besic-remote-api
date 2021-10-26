import { useRouter } from 'next/router'

import { ApiDevice } from '../lib/types'
import { elapsedTime, formatIP } from '../lib/utils'

export default function DataTable(props: ApiDevice[]) {
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
          <th>MAC</th>
          <th>ID</th>
          <th>LUX</th>
          <th>TMP</th>
          <th>PRS</th>
          <th>HUM</th>
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
  let relay_id = dev.relay_id ? dev.relay_id.toString() : "-"
  if (dev.relay_id == 0) {
    relay_id = "BS"
  }
  if (dev.data) {
    return (
      <tr onClick={() => router.push(`/device?mac=${dev.mac}`)}>
        <td><a>{dev.mac}</a></td>
        <td><a>{relay_id}</a></td>
        <td><a>{dev.data.lux}</a></td>
        <td><a>{dev.data.tmp}</a></td>
        <td><a>{dev.data.prs}</a></td>
        <td><a>{dev.data.hum}</a></td>
        <td><a>{formatIP(dev.addr)}</a></td>
        <td><a>{elapsedTime(dev.last_seen)}</a></td>
      </tr>
    )
  } else {
    return (
      <tr onClick={() => router.push(`/device?mac=${dev.mac}`)}>
        <td><a>{dev.mac}</a></td>
        <td><a>{relay_id}</a></td>
        <td><a>--</a></td>
        <td><a>--</a></td>
        <td><a>--</a></td>
        <td><a>--</a></td>
        <td><a>{formatIP(dev.addr)}</a></td>
        <td><a>{elapsedTime(dev.last_seen)}</a></td>
      </tr>
    )
  }
}
