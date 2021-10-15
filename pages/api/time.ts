import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let time = new Date(Date.now())
  return res.status(200).send({
    iso: time,
    unix: Math.floor(time.getTime()/1000),
    text: time.toString(),
  })
}
