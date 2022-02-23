import { Request } from 'express';
import { getClientIp } from 'request-ip'
import * as Prisma from '@prisma/client'
import * as bcrypt from 'bcrypt'

import { prisma, MAC_REGEX } from './db'
import { InternalDevice, ApiResult } from './types'


const TIMEOUT_MILLISEC = 1000*60*5; // 5 minutes


export async function checkDeviceAuth(req: Request): Promise<InternalDevice | ApiResult> {
  if (req.body.mac == null) {
    return new ApiResult(400, "MAC required")
  }
  if (!Array.isArray(req.body.mac) && !MAC_REGEX.test(req.body.mac)) {
    return new ApiResult(400, "Invalid MAC")
  }
  if (req.body.password == null) {
    return new ApiResult(400, "Password required")
  }
  if (Array.isArray(req.body.password)) {
    return new ApiResult(400, "Invalid password (Array)")
  }
  const result: Prisma.Device | null = await prisma.device.findUnique({
    where: { mac: req.body.mac.toString() },
  })
  if (result == null) {
    return new ApiResult(404, "Unknown device")
  }
  if (!await bcrypt.compare(req.body.password, result.password)) {
    return new ApiResult(401, "Incorrect Password")
  }
  updateDeviceSeen(result, req.ip)
  return new InternalDevice(result)
}

async function updateDeviceSeen(dev: Prisma.Device, ip: string) {
  let time = new Date(Date.now())
  if (time.getTime() - dev.last_seen.getTime() > TIMEOUT_MILLISEC) {
    //console.log(time, "->", dev.last_seen)
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
