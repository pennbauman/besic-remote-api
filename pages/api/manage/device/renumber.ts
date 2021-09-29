import { NextApiRequest, NextApiResponse } from 'next'

import { ApiResult, ApiDeployment, ApiDevice } from '../../../../lib/types'
import { prisma, getDeploymentObj, getDeviceObj } from '../../../../lib/db'
import { checkManageAuth } from '../../../../lib/manage'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.query.name)) {
    return res.status(400).send("Invalid name")
  }
  if (Array.isArray(req.query.mac)) {
    return res.status(400).send("Invalid name")
  }
  if (req.query.id == null) {
    return res.status(400).send("ID required")
  }
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  let deployment = await getDeploymentObj(req.query.name)
  if (deployment instanceof ApiResult) {
    return deployment.send(res)
  } else if (deployment instanceof ApiDeployment) {
    if (deployment.locked) {
      return res.status(405).send("Deployment locked")
    }
    let device = await getDeviceObj(req.query.mac)
    if (device instanceof ApiResult) {
      return device.send(res)
    } else if (device instanceof ApiDevice) {
      if (device.deployment != req.query.name) {
        return res.status(405).send("Device not in deployment")
      }
      if (device.type == "BASESTATION") {
        return res.status(405).send("Cannot renumber basestation")
	  }
      let id = Number(req.query.id)
      if (isNaN(id)) {
        return res.status(400).send("Invalid ID")
      }
      for (let i = 0; i < deployment.devices.length; i++) {
        if (deployment.devices[i].relay_id == id) {
          return res.status(406).send("ID already used in deployment")
        }
      }
      await prisma.device.update({
        where: { mac: req.query.mac },
        data: {
          relay_id: id,
        }
      })
      return res.status(200).send("Success")
    } else {
      return res.status(500).send("default")
    }
  } else {
    return res.status(500).send("default")
  }
}
