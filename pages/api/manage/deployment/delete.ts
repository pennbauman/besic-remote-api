import { NextApiRequest, NextApiResponse } from 'next'
import * as Prisma from '@prisma/client'

import { ApiResult, ApiDeployment } from '../../../../lib/types'
import { prisma, getDeploymentObj } from '../../../../lib/db'
import { checkManageAuth } from '../../../../lib/manage'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.query.name)) {
    return res.status(400).send("Invalid name")
  }
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  let result = await getDeploymentObj(req.query.name)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiDeployment) {
    if (result.locked) {
       return res.status(405).send("Deployment locked")
    }
    if (result.devices.length > 0) {
       return res.status(405).send("Deployment has devices")
    }
    await prisma.deployment.delete({
       where: { name: req.query.name},
    })
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
}