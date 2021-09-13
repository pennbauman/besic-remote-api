import { NextApiRequest, NextApiResponse } from 'next'

import { newDevice } from '../../../lib/device'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let result = await newDevice(req)
  return res.status(result.code).send(result.text)
}
