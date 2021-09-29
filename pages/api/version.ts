import { NextApiRequest, NextApiResponse } from 'next'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let revision = require('child_process').execSync('git rev-parse HEAD').toString().trim()
  let edits = require('child_process').execSync('git status --short').toString().trim()
  if (edits == "") {
    return res.status(200).send({ git: revision })
  } else {
    return res.status(200).send({ git: revision, dev: true })
  }
}
