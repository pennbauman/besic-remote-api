import { NextApiRequest, NextApiResponse } from 'next'

import { ApiDevice, ApiResult } from '../../../lib/types'
import { getReadyDevicesArr } from '../../../lib/db'

//// Arguements
  //  name: name identifying deployment to query about
//// Return
  //  device: array [
  //    ApiDevice {
  //      type: device type ('RELAY' or 'BASESTATION')
  //      mac: 12 hex digits of device mac
  //      nickname: OPTIONAL device nickname
  //      last_seen: time device was last seen
  //      addr: IP address device was last seen at
  //      data: ApiData { // OPTIONAL
  //        lux: last lux data reading
  //        tmp: last temperature data reading
  //        prs: last pressure data reading
  //        hum: last humidity data reading
  //      }
  //    }
  //  ]

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let result = await getReadyDevicesArr()
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (Array.isArray(result)) {
    return res.status(200).send(result)
  } else {
    return res.status(500).send("default")
  }
}
