import { NextApiRequest, NextApiResponse } from 'next'

import { ApiResult, ApiDevice } from '../../../../lib/types'
import { prisma, NAME_REGEX, getDeviceObj } from '../../../../lib/db'
import { checkManageAuth } from '../../../../lib/manage'

//// Arguements
  //  mac: 12 hex digits identifying device to nickname
  //  nickname: nickname to give device
//// Return
  //  result message

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.body.mac)) {
    return res.status(400).send("Invalid MAC (Array)")
  }
  if (req.body.nickname == null) {
    return res.status(400).send("Nickname required")
  }
  if (Array.isArray(req.body.nickname)) {
    return res.status(400).send("Invalid nickname (Array)")
  }
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  if (!NAME_REGEX.test(req.body.nickname)) {
    return res.status(400).send("Invalid nickname")
  }
  let result = await getDeviceObj(req.body.mac)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiDevice) {
    await prisma.device.update({
      where: { mac: req.body.mac},
      data: { nickname: req.body.nickname }
    })
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
}
