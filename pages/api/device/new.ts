import { NextApiRequest, NextApiResponse } from 'next'
import { getClientIp } from 'request-ip'
import * as bcrypt from 'bcrypt'

import { prisma, MAC_REGEX } from '../../../lib/db'

//// Arguements
  //  mac: 12 hex digits identifying the device to create
  //  password: device password
  //  type: device type ('RELAY' or 'BASESTATION')
//// Return
  //  result message

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.body.mac == null) {
    return res.status(400).send("MAC required")
  }
  if (!Array.isArray(req.body.mac) && !MAC_REGEX.test(req.body.mac)) {
    return res.status(400).send("Invalid MAC")
  }
  if (req.body.password == null) {
    return res.status(400).send("Password required")
  }
  if (Array.isArray(req.body.password)) {
    return res.status(400).send("Invalid password (Array)")
  }
  if (req.body.type == null) {
    return res.status(400).send("Type required")
  }
  if (req.body.type != "RELAY" && req.body.type != "BASESTATION") {
    return res.status(400).send("Invalid type")
  }
  let salt = await bcrypt.genSalt(8)
  let time = new Date(Date.now())
  try {
    let result = await prisma.device.create({
      data: {
        type: req.body.type,
        mac: req.body.mac.toString(),
        last_seen: time.toISOString(),
        addr: getClientIp(req),
        password: await bcrypt.hash(req.body.password, salt),
      }
    })
  } catch (err) {
    if (err.code == 'P2002') {
      let prev = await prisma.device.findUnique({
        where: { mac: req.body.mac.toString() }
      })
      if (prev.deployment == null) {
        await prisma.device.update({
          where: { mac: req.body.mac.toString() },
          data: {
            type: req.body.type,
            mac: req.body.mac.toString(),
            last_seen: time.toISOString(),
            addr: getClientIp(req),
            password: await bcrypt.hash(req.body.password, salt),
          }
        })
      } else {
        return res.status(406).send("Duplicate device")
      }
    }
    console.log("NEW ERR: ", err)
  }
  return res.status(200).send("Success")
}
