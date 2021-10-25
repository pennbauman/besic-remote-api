import { NextApiRequest, NextApiResponse } from 'next'

import { ApiResult, ApiDeployment, ApiDevice } from '../../../../lib/types'
import { prisma, getDeploymentObj, getDeviceObj } from '../../../../lib/db'
import { checkManageAuth } from '../../../../lib/manage'

//// Arguements
  //  name: name identifying deployment to insert into
  //  mac: 12 hex digits identifying device to insert
  //  id: OPTIONAL id to insert device with
  //    NOTE has not effect on basestations which always have relay_id = 0
//// Return
  //  result message

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.body.name)) {
    return res.status(400).send("Invalid name")
  }
  if (Array.isArray(req.body.mac)) {
    return res.status(400).send("Invalid name")
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
      if (device.deployment) {
        return res.status(405).send("Device already deployed")
      }
      let id = 0
      if (device.type == "BASESTATION") {
        for (let i = 0; i < deployment.devices.length; i++) {
          if (deployment.devices[i].type == "BASESTATION") {
            return res.status(406).send("Deployment already has basestation")
          }
        }
      } else {
        if (req.body.id) {
          let num = Number(req.body.id)
          if (isNaN(num)) {
            return res.status(400).send("Invalid ID")
          }
          id = num
        } else {
          let ids = []
          for (let i = 0; i < deployment.devices.length; i++) {
            ids.push(deployment.devices[i].relay_id)
          }
          ids.sort();
          let prev = 0
          for (let i = 0; i < ids.length; i++) {
            if (prev + 1 < ids[i]) {
              break
            }
            prev = ids[i]
          }
          id = prev + 1
        }
      }
      await prisma.device.update({
        where: { mac: req.body.mac },
        data: {
          deployment: req.body.name,
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
