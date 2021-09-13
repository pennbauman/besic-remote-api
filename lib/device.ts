import { NextApiRequest } from 'next'
import { getClientIp } from 'request-ip'
import * as Prisma from '@prisma/client'
import * as bcrypt from 'bcrypt'

import { InternalDevice, ApiDevice, ApiDeployment, ApiResult } from './types'


const prisma = new Prisma.PrismaClient()

const MAC_REGEX = /[A-Fa-f0-9]{12}/
const TIMEOUT_MILLISEC = 1000*60*5; // 5 minutes


export async function newDevice(req: NextApiRequest): Promise<ApiResult> {
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
  if (req.query.type == null) {
    return new ApiResult(400, "Type required")
  }
  if (req.query.type != "RELAY" && req.query.type != "BASESTATION") {
    return new ApiResult(400, "Invalid type")
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
      return new ApiResult(406, "Duplicate device")
    }
    console.log("NEW ERR: ", err)
  }
  return new ApiResult(200, "Success")
}

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

export async function setDeviceData(mac: string, raw_data: string): Promise<ApiResult> {
  let data: { [key: string]: string } = {}
  raw_data.split(",").forEach((text) => {
    let pair = text.split("=")
    if (pair.length != 2) {
      return new ApiResult(400, `Invalid data '${text}'`)
    }
    data[pair[0]] = pair[1]
  })
  let values = ['lux', 'temperature', 'pressure', 'humidity']
  for (let i = 0; i < values.length; i++) {
    if (data[values[i]] == null) {
      return new ApiResult(400, `Missing data value '${values[i]}'`)
    }
  }
  let result = await prisma.data.upsert({
    where: {
      mac: mac,
    },
    update: {
      lux: data['lux'],
      temperature: data['temperature'],
      pressure: data['pressure'],
      humidity: data['humidity'],
    },
    create: {
      mac: mac,
      lux: data['lux'],
      temperature: data['temperature'],
      pressure: data['pressure'],
      humidity: data['humidity'],
    }
  })
  return new ApiResult(200, "Success")
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

export async function getDeviceObj(mac: string): Promise<ApiDevice | ApiResult> {
  if (mac == null) {
    return new ApiResult(400, "MAC required")
  }
  if (!MAC_REGEX.test(mac)) {
    return new ApiResult(400, "Invalid MAC")
  }
  const device: Prisma.Device | null = await prisma.device.findUnique({
    where: { mac: mac },
  })
  if (device == null) {
    return new ApiResult(404, "Unknown device")
  }
  const data: Prisma.Data | null = await prisma.data.findUnique({
    where: { mac: mac },
  })
  const log: Prisma.Log[] | null = await prisma.log.findMany({
    where: { mac: mac },
  })
  return new ApiDevice(device, data, log)
}

export async function getDeploymentObj(name: string): Promise<ApiDeployment | ApiResult> {
  if (name == null) {
    return new ApiResult(400, "Name required")
  }
  const deployment: Prisma.Deployment | null = await prisma.deployment.findUnique({
    where: { name: name},
  })
  if (deployment == null) {
    return new ApiResult(404, "Unknown deployment")
  }
  const devices: Prisma.Device[] = await prisma.device.findMany({
    where: { deployment: name},
  })
  let result = new ApiDeployment(deployment, devices)
  let data = []
  for (let i = 0; i < result.devices.length; i++) {
    data[i] = prisma.data.findUnique({
      where: { mac: result.devices[i].mac },
    })
  }
  for (let i = 0; i < result.devices.length; i++) {
    result.devices[i].data = await data[i]
  }
  return result
}
