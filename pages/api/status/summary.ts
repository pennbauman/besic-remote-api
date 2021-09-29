import { NextApiRequest, NextApiResponse } from 'next'

import { ApiSummary, ApiResult} from '../../../lib/types'
import { getSummaryObj } from '../../../lib/db'

//// No Arguements
//// Return
  //  ApiSummary {
  //    devices: array [
  //      string: device mac
  //    ]
  //    deployments: array [
  //      string: deployment name
  //    ]
  //  }

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let result = await getSummaryObj()
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiSummary) {
    return res.status(200).send(result)
  } else {
    return res.status(500).send("default")
  }
}
