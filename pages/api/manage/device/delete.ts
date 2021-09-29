import { NextApiRequest, NextApiResponse } from 'next'

import { ApiResult, ApiDevice } from '../../../../lib/types'
import { prisma, getDeviceObj } from '../../../../lib/db'
import { checkManageAuth, setDeploymentLock } from '../../../../lib/manage'

//// Arguements
  //  mac: 12 hex digits identifying device to delete
//// Return
  //  result message

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.query.mac)) {
    return res.status(400).send("Invalid MAC")
  }
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  let result = await getDeviceObj(req.query.mac)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiDevice) {
    if (result.deployment) {
      return res.status(405).send("Device deployed")
    }
    await prisma.$transaction([
      prisma.log.deleteMany({
        where: { mac: req.query.mac },
      }),
      prisma.data.deleteMany({
        where: { mac: req.query.mac },
      }),
      prisma.device.delete({
        where: { mac: req.query.mac },
      }),
    ])
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
}
