import { NextApiRequest, NextApiResponse } from 'next'

import { ApiResult} from '../../../../lib/types'
import { checkManageAuth, setDeploymentLock } from '../../../../lib/manage'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.query.name)) {
    return res.status(400).send("Invalid name")
  }
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  let result = await setDeploymentLock(req.query.name, true)
  return result.send(res)
}
