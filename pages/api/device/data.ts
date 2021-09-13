import { NextApiRequest, NextApiResponse } from 'next'

import { checkDeviceAuth, setDeviceData } from '../../../lib/device'
import { InternalDevice, ApiResult} from '../../../lib/types'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let result = await checkDeviceAuth(req)
  if (result instanceof ApiResult) {
    return res.status(result.code).send(result.text)
  } else if (result instanceof InternalDevice) {
    if (req.query.data == null) {
      return res.status(400).send("Data required")
    }
    let update = await setDeviceData(result.mac, req.query.data.toString())
    return res.status(update.code).send(update.text)
  } else {
    return res.status(500).send("default")
  }
}
