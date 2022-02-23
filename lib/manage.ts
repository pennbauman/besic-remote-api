import { Request } from 'express';
import { getClientIp } from 'request-ip'
import * as Prisma from '@prisma/client'

import { prisma } from './db'
import { ApiResult} from './types'
import { LOCALHOST } from './utils'


export async function checkManageAuth(req: Request): Promise<boolean> {
  if (LOCALHOST.includes(req.ip)) {
    return true
  }
  return false
}
