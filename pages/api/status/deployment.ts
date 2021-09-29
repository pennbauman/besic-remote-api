import { NextApiRequest, NextApiResponse } from 'next'

import { getDeploymentObj } from '../../../lib/db'
import { ApiDeployment, ApiResult} from '../../../lib/types'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.name == null) {
    return new ApiResult(400, "Name required")
  }
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
