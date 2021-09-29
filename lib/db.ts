import * as Prisma from '@prisma/client'

import { ApiResult, ApiDevice, ApiDeployment, ApiSummary } from './types'


export const MAC_REGEX = /[A-Fa-f0-9]{12}/
export const prisma = new Prisma.PrismaClient()


export async function getDeviceObj(mac: string): Promise<ApiDevice | ApiResult> {
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
