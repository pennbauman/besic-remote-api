import { NextApiRequest, NextApiResponse } from 'next'

import { ApiResult, ApiDeployment, ApiDevice } from '../../../../lib/types'
import { prisma, getDeploymentObj, getDeviceObj } from '../../../../lib/db'
import { checkManageAuth } from '../../../../lib/manage'

//// Arguements
  //  name: name identifying deployment to remove from
  //  mac: 12 hex digits identifying device to remove
//// Return
  //  result message

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.body.name)) {
    return res.status(400).send("Invalid name (Array)")
  }
  if (Array.isArray(req.body.mac)) {
    return res.status(400).send("Invalid name (Array)")
  }
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  let deployment = await getDeploymentObj(req.body.name)
  if (deployment instanceof ApiResult) {
    return deployment.send(res)
  } else if (deployment instanceof ApiDeployment) {
    if (deployment.locked) {
      return res.status(405).send("Deployment locked")
    }
    let device = await getDeviceObj(req.body.mac)
    if (device instanceof ApiResult) {
      return device.send(res)
    } else if (device instanceof ApiDevice) {
      for (let i = 0; i < deployment.devices.length; i++) {
        if (deployment.devices[i].mac == req.body.mac) {
          await prisma.device.update({
            where: { mac: req.body.mac },
            data: {
              deployment: null,
              relay_id: null,
            }
          })
          return res.status(200).send("Success")
        }
      }
      return res.status(404).send("Device not in deployment")
    } else {
      return res.status(500).send("default")
    }
  } else {
    return res.status(500).send("default")
  }
}
