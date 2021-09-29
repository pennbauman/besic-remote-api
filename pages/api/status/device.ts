import { NextApiRequest, NextApiResponse } from 'next'

import { ApiDevice, ApiResult} from '../../../lib/types'
import { getDeviceObj } from '../../../lib/db'

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
