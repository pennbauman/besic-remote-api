import { NextApiRequest, NextApiResponse } from 'next'
import * as Prisma from '@prisma/client'

import { prisma, DEPLOYMENT_REGEX } from '../../../../lib/db'
import { checkManageAuth } from '../../../../lib/manage'
import { ApiResult} from '../../../../lib/types'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.query.name)) {
    return res.status(400).send("Invalid name")
  }
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  if (req.query.name == null) {
    return res.status(400).send("Name required")
  }
  if (!DEPLOYMENT_REGEX.test(req.query.name)) {
    return res.status(400).send("Invalid name")
  }
  const deployment: Prisma.Deployment | null = await prisma.deployment.findUnique({
    where: { name: req.query.name},
  })
  if (deployment == null) {
    return res.status(404).send("Unknown deployment")
  }
  if (deployment.locked) {
    return res.status(405).send("Deployment locked")
  }
  const devices: Prisma.Device[] = await prisma.device.findMany({
    where: { deployment: req.query.name},
  })
  if (devices.length > 0) {
    return res.status(405).send("Deployment has devices")
  }
  let result = await prisma.deployment.delete({
    where: { name: req.query.name},
  })
  return res.status(200).send("Success")
}
