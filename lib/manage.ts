import { NextApiRequest } from 'next'
import { getClientIp } from 'request-ip'
import * as Prisma from '@prisma/client'

import { prisma } from './db'
import { ApiResult} from './types'
import { LOCALHOST } from './utils'


export async function checkManageAuth(req: NextApiRequest): Promise<boolean> {
  let ip = getClientIp(req);
  if (LOCALHOST.includes(ip)) {
    return true
  }
  return false
}

export async function setDeploymentLock(name: string, state: boolean): Promise<ApiResult> {
  if (name == null) {
    return new ApiResult(400, "Name required")
  }
  const deployment: Prisma.Deployment | null = await prisma.deployment.findUnique({
    where: { name: name},
  })
  if (deployment == null) {
    return new ApiResult(404, "Unknown deployment")
  }
  if (deployment.locked == state) {
    if (state) {
      return new ApiResult(200, "Deployment already locked")
    } else {
      return new ApiResult(200, "Deployment already unlocked")
    }
  }
  let result = await prisma.deployment.update({
    where: { name: name},
    data: { locked: state },
  })
  return new ApiResult(200, "Success")
}
