import { NextApiRequest, NextApiResponse } from 'next'

import { InternalDevice, ApiResult} from '../../../lib/types'
import { checkDeviceAuth } from '../../../lib/device'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let result = await checkDeviceAuth(req)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof InternalDevice) {
    let deployment_conf = ""
    if (result.deployment) {
      deployment_conf += `DEPLOYMENT_NAME="${result.deployment}"\n`
    } else {
      deployment_conf += `DEPLOYMENT_NAME=""\n`
    }
    if (result.relay_id) {
      deployment_conf += `RELAY_ID="${result.relay_id}"\n`
    } else {
      deployment_conf += `RELAY_ID=""\n`
    }
    return res.status(200).send(deployment_conf)
  } else {
    return res.status(500).send("default")
  }
}
