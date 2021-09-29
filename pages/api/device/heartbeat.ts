import { NextApiRequest, NextApiResponse } from 'next'

import { InternalDevice, ApiResult} from '../../../lib/types'
import { checkDeviceAuth } from '../../../lib/device'

//// Arguements
  //  mac: 12 hex digits identifying the connecting device
  //  password: device password
//// Return
  //  result message

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let result = await checkDeviceAuth(req)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof InternalDevice) {
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
}
