import * as Prisma from '@prisma/client'

import { ApiResult, ApiDevice, ApiBox, ApiSummary, ApiAll } from './types'


export const MAC_REGEX = /^[A-Fa-f0-9]{12}$/
export const NAME_REGEX = /^[a-zA-Z][\w-| ]*$/
export const prisma = new Prisma.PrismaClient()


export async function getDeviceObj(mac: string): Promise<ApiDevice | ApiResult> {
  if (!MAC_REGEX.test(mac)) {
    return new ApiResult(400, "Invalid MAC")
  }
  const device = await prisma.device.findUnique({
    where: { mac: mac },
    include: { data: true, log: true }
  })
  if (device == null) {
    return new ApiResult(404, "Unknown device")
  }
  return new ApiDevice(device, device.data, device.log)
}

export async function getBoxObj(name: string): Promise<ApiBox | ApiResult> {
  if (!NAME_REGEX.test(name)) {
    return new ApiResult(400, "Invalid name")
  }
  const box = await prisma.box.findUnique({
    where: { name: name},
    include: {
      devices: {
        include: { data: true }
      }
    }
  })
  if (box == null) {
    return new ApiResult(404, "Unknown box")
  }
  let result = new ApiBox(box, box.devices)
  return result
}

export async function getSummaryObj(): Promise<ApiSummary | ApiResult> {
  let result = new ApiSummary()
  const devices: Prisma.Device[] = await prisma.device.findMany({})
  for (let i = 0; i < devices.length; i++) {
    result.devices.push(devices[i].mac)
  }
  const boxes: Prisma.Box[] = await prisma.box.findMany({})
  for (let i = 0; i < boxes.length; i++) {
    result.boxes.push(boxes[i].name)
  }
  return result
}

export async function getUnboxedDevicesArr(): Promise<ApiDevice[] | ApiResult> {
  let result: ApiDevice[] = []
  const devices = await prisma.device.findMany({
    where: { box: null },
    include: { data: true }
  })
  for (let i = 0; i < devices.length; i++) {
    result.push(new ApiDevice(devices[i], devices[i].data, null))
  }
  return result
}

export async function getAllObj(): Promise<ApiAll | ApiResult> {
  let result = new ApiAll()
  const devices = await prisma.device.findMany({
    where: { box: null },
    include: { data: true }
  })
  for (let i = 0; i < devices.length; i++) {
    result.undeployed.push(new ApiDevice(devices[i], devices[i].data, null))
  }
  const boxes = await prisma.box.findMany({
    include: {
      devices: {
        include: { data: true }
      }
    }
  })
  for (let i = 0; i < boxes.length; i++) {
    result.boxes.push(new ApiBox(boxes[i], boxes[i].devices))
  }
  return result
}
