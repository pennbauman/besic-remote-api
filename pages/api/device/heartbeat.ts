import { NextApiRequest, NextApiResponse } from 'next'

import { checkDeviceAuth } from '../../../lib/device'
import { InternalDevice, ApiResult} from '../../../lib/types'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let result = await checkDeviceAuth(req)
  if (result instanceof ApiResult) {
    return res.status(result.code).send(result.text)
  } else if (result instanceof InternalDevice) {
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
}
