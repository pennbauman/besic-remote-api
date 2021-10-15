import { NextApiRequest, NextApiResponse } from 'next'

import { ApiAll, ApiResult} from '../../../lib/types'
import { getAllObj } from '../../../lib/db'

//// No Arguements
//// Return
  //  ApiAll {
  //    ready: array [
  //      type: device type ('RELAY' or 'BASESTATION')
  //      mac: 12 hex digits of device mac
  //      nickname: OPTIONAL device nickname
  //      last_seen: time device was last seen
  //      addr: IP address device was last seen at
  //      data: ApiData {
  //        lux: last lux data reading
  //        temperature: last temperature data reading
  //        pressure: last pressure data reading
  //        humidity: last humidity data reading
  //      }
  //    ]
  //    deployments: array [
  //      name: deployment name
  //      locked: if deployment is locked (boolean)
  //      device: array [
  //        ApiDevice {
  //          deployment: deployment name
  //          type: device type ('RELAY' or 'BASESTATION')
  //          relay_id: device id within deployment (int)
  //          mac: 12 hex digits of device mac
  //          nickname: OPTIONAL device nickname
  //          last_seen: time device was last seen
  //          addr: IP address device was last seen at
  //          data: {
  //            lux: last lux data reading
  //            temperature: last temperature data reading
  //            pressure: last pressure data reading
  //            humidity: last humidity data reading
  //          }
  //        }
  //      ]
  //    ]
  //  }

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let result = await getAllObj()
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiAll) {
    return res.status(200).send(result)
  } else {
    return res.status(500).send("default")
  }
}
