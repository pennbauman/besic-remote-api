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
  if (req.query.mac == null) {
    return res.status(400).send("MAC required")
  }
  if (!Array.isArray(req.query.mac) && !MAC_REGEX.test(req.query.mac)) {
    return res.status(400).send("Invalid MAC")
  }
  if (req.query.password == null) {
    return res.status(400).send("Password required")
  }
  if (Array.isArray(req.query.password)) {
    return res.status(400).send("Invalid password")
  }
  if (req.query.type == null) {
    return res.status(400).send("Type required")
  }
  if (req.query.type != "RELAY" && req.query.type != "BASESTATION") {
    return res.status(400).send("Invalid type")
  }
  let salt = await bcrypt.genSalt(8)
  let time = new Date(Date.now())
  try {
    let result = await prisma.device.create({
      data: {
        type: req.query.type,
        mac: req.query.mac.toString(),
        last_seen: time.toISOString(),
        addr: getClientIp(req),
        password: await bcrypt.hash(req.query.password, salt),
      }
    })
  } catch (err) {
    if (err.code == 'P2002') {
      let prev = await prisma.device.findUnique({
        where: { mac: req.query.mac.toString() }
      })
      if (prev.deployment == null) {
        await prisma.device.update({
          where: { mac: req.query.mac.toString() },
          data: {
            type: req.query.type,
            mac: req.query.mac.toString(),
            last_seen: time.toISOString(),
            addr: getClientIp(req),
            password: await bcrypt.hash(req.query.password, salt),
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
