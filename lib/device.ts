import { NextApiRequest } from 'next'
import { getClientIp } from 'request-ip'
import * as Prisma from '@prisma/client'
import * as bcrypt from 'bcrypt'

import { prisma, MAC_REGEX } from './db'
import { InternalDevice, ApiResult } from './types'


const TIMEOUT_MILLISEC = 1000*60*5; // 5 minutes


export async function checkDeviceAuth(req: NextApiRequest): Promise<InternalDevice | ApiResult> {
  if (req.query.mac == null) {
    return new ApiResult(400, "MAC required")
  }
  if (!Array.isArray(req.query.mac) && !MAC_REGEX.test(req.query.mac)) {
    return new ApiResult(400, "Invalid MAC")
  }
  if (req.query.password == null) {
    return new ApiResult(400, "Password required")
  }
  if (Array.isArray(req.query.password)) {
    return new ApiResult(400, "Invalid password")
  }
  const result: Prisma.Device | null = await prisma.device.findUnique({
    where: { mac: req.query.mac.toString() },
  })
  if (result == null) {
    return new ApiResult(404, "Unknown device")
  }
  if (!await bcrypt.compare(req.query.password, result.password)) {
    return new ApiResult(401, "Invalid Password")
  }
  updateDeviceSeen(result, getClientIp(req))
  return new InternalDevice(result)
}

async function updateDeviceSeen(dev: Prisma.Device, ip: string) {
  let time = new Date(Date.now())
  if (time.getTime() - dev.last_seen.getTime() > TIMEOUT_MILLISEC) {
    console.log(time, "->", dev.last_seen)
    await prisma.log.createMany({
      data: [
        { mac: dev.mac, timestamp: dev.last_seen, event: "lost" },
        { mac: dev.mac, timestamp: time, event: "found" },
      ]
    })
  }
  await prisma.device.update({
    where: { mac: dev.mac },
    data: {
      last_seen: time.toISOString(),
      addr: ip,
    }
  })
}
