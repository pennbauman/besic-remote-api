import { NextApiRequest, NextApiResponse } from 'next'

import { ApiDevice, ApiResult} from '../../../lib/types'
import { getDeviceObj } from '../../../lib/db'

//// Arguements
  //  mac: 12 hex digits identifying device to query about
//// Return
  //  ApiDevice {
  //    deployment: OPTIONAL deployment name
  //    type: device type ('RELAY' or 'BASESTATION')
  //    relay_id: OPTIONAL device id within deployment (int)
  //    mac: 12 hex digits of device mac
  //    nickname: OPTIONAL device nickname
  //    last_seen: time device was last seen
  //    addr: IP address device was last seen at
  //    data: ApiData {
  //      lux: last lux data reading
  //      temperature: last temperature data reading
  //      pressure: last pressure data reading
  //      humidity: last humidity data reading
  //    }
  //    log: array [
  //      ApiLog {
  //        timestamp: time of event
  //        event: event that occured with device ('found' or 'lost')
  //      }
  //    ]
  //  }

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.query.mac)) {
    return res.status(400).send("Invalid MAC")
  }
  let result = await getDeviceObj(req.query.mac)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiDevice) {
    return res.status(200).send(result)
  } else {
    return res.status(500).send("default")
  }
}
