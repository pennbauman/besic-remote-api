import { NextApiRequest, NextApiResponse } from 'next'

import { ApiDeployment, ApiResult} from '../../../lib/types'
import { getDeploymentObj } from '../../../lib/db'

//// Arguements
  //  name: name identifying deployment to query about
//// Return
  //  ApiDeployment {
  //    name: deployment name
  //    locked: if deployment is locked (boolean)
  //    device: array [
  //      ApiDevice {
  //        deployment: deployment name
  //        type: device type ('RELAY' or 'BASESTATION')
  //        relay_id: device id within deployment (int)
  //        mac: 12 hex digits of device mac
  //        nickname: OPTIONAL device nickname
  //        last_seen: time device was last seen
  //        addr: IP address device was last seen at
  //        data: { // OPTIONAL
  //          lux: last lux data reading
  //          tmp: last temperature data reading
  //          prs: last pressure data reading
  //          hum: last humidity data reading
  //        }
  //      }
  //    ]
  //  }

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.query.name)) {
    return res.status(400).send("Invalid name")
  }
  let result = await getDeploymentObj(req.query.name)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiDeployment) {
    return res.status(200).send(result)
  } else {
    return res.status(500).send("default")
  }
}
