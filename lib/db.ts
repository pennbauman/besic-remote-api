import * as Prisma from '@prisma/client'

import { ApiResult, ApiDevice, ApiDeployment, ApiSummary, ApiAll } from './types'


export const MAC_REGEX = /^[A-Fa-f0-9]{12}$/
export const NAME_REGEX = /^[a-zA-Z][\w-| ]*$/
export const prisma = new Prisma.PrismaClient()


export async function getDeviceObj(mac: string): Promise<ApiDevice | ApiResult> {
  if (mac == null) {
    return new ApiResult(400, "MAC required")
  }
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

export async function getDeploymentObj(name: string): Promise<ApiDeployment | ApiResult> {
  if (name == null) {
    return new ApiResult(400, "Name required")
  }
  if (!NAME_REGEX.test(name)) {
    return new ApiResult(400, "Invalid name")
  }
  const deployment = await prisma.deployment.findUnique({
    where: { name: name},
    include: {
      devices: {
        include: { data: true }
      }
    }
  })
  if (deployment == null) {
    return new ApiResult(404, "Unknown deployment")
  }
  let result = new ApiDeployment(deployment, deployment.devices)
  return result
}

export async function getSummaryObj(): Promise<ApiSummary | ApiResult> {
  let result = new ApiSummary()
  const devices: Prisma.Device[] = await prisma.device.findMany({})
  for (let i = 0; i < devices.length; i++) {
    result.devices.push(devices[i].mac)
  }
  const deployments: Prisma.Deployment[] = await prisma.deployment.findMany({})
  for (let i = 0; i < deployments.length; i++) {
    result.deployments.push(deployments[i].name)
  }
  return result
}

export async function getReadyDevicesArr(): Promise<ApiDevice[] | ApiResult> {
  let result: ApiDevice[] = []
  const devices = await prisma.device.findMany({
    where: { deployment: null },
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
    where: { deployment: null },
    include: { data: true }
  })
  for (let i = 0; i < devices.length; i++) {
    result.ready.push(new ApiDevice(devices[i], devices[i].data, null))
  }
  const deployments = await prisma.deployment.findMany({
    include: {
      devices: {
        include: { data: true }
      }
    }
  })
  for (let i = 0; i < deployments.length; i++) {
    result.deployments.push(new ApiDeployment(deployments[i], deployments[i].devices))
  }
  return result
}
