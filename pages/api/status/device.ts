import { NextApiRequest, NextApiResponse } from 'next'

import { getDeviceObj } from '../../../lib/db'
import { ApiDevice, ApiResult} from '../../../lib/types'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.mac == null) {
    return new ApiResult(400, "MAC required")
  }
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
