import { NextApiRequest, NextApiResponse } from 'next'

import { ApiAll, ApiResult} from '../../../lib/types'
import { getAllObj } from '../../../lib/db'

//// No Arguements
//// Return
  //  ApiAll {
  //    undeployed: array [
  //      ApiDevice {
  //        type: device type ('RELAY' or 'BASESTATION')
  //        mac: 12 hex digits of device mac
  //        nickname: OPTIONAL device nickname
  //        last_seen: time device was last seen
  //        addr: IP address device was last seen at
  //        data: ApiData { // OPTIONAL
  //          lux: last lux data reading
  //          tmp: last temperature data reading
  //          prs: last pressure data reading
  //          hum: last humidity data reading
  //        }
  //      }
  //    ]
  //    deployments: array [
  //      ApiDeployment {
  //        name: deployment name
  //        locked: if deployment is locked (boolean)
  //        devices: array [
  //          ApiDevice {
  //            deployment: deployment name
  //            type: device type ('RELAY' or 'BASESTATION')
  //            relay_id: device id within deployment (int)
  //            mac: 12 hex digits of device mac
  //            nickname: OPTIONAL device nickname
  //            last_seen: time device was last seen
  //            addr: IP address device was last seen at
  //            data: { // OPTIONAL
  //              lux: last lux data reading
  //              tmp: last temperature data reading
  //              prs: last pressure data reading
  //              hum: last humidity data reading
  //            }
  //          }
  //        ]
  //      }
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
