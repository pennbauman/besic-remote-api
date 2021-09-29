import { NextApiResponse } from 'next'
import * as Prisma from '@prisma/client'

export class InternalDevice {
  deployment?: string
  type: Prisma.DeviceType
  relay_id?: number
  mac: string
  nickname?: string
  last_seen: Date
  addr: string

  constructor(device: Prisma.Device) {
    if (device.deployment) {
      this.deployment = device.deployment
    }
    this.type = device.type
    if (device.relay_id) {
      this.relay_id = device.relay_id
    }
    this.mac = device.mac
    if (device.nickname) {
      this.nickname = device.nickname
    }
    this.last_seen = device.last_seen
    this.addr = device.addr
  }

}

export class ApiData {
  lux: string
  temperature: string
  pressure: string
  humidity: string
}

export class ApiLog {
  timestamp: Date
  event: string
}

export class ApiDevice {
  deployment: string
  type: Prisma.DeviceType
  relay_id?: number
  mac: string
  nickname?: string
  last_seen: Date
  addr: string
  data: ApiData
  log?: ApiLog[]

  constructor(device: Prisma.Device, data: Prisma.Data, log: Prisma.Log[]) {
    if (device.deployment) {
      this.deployment = device.deployment
    }
    this.type = device.type
    if (device.relay_id) {
      this.relay_id = device.relay_id
    }
    this.mac = device.mac
    if (device.nickname) {
      this.nickname = device.nickname
    }
    this.last_seen = device.last_seen
    this.addr = device.addr

    this.data = data
    if (log) {
      this.log = log
    }
  }
}

export class ApiDeployment {
  name: string
  locked: boolean
  devices: ApiDevice[]

  constructor(deployment: Prisma.Deployment, devices: Prisma.Device[]) {
    this.name = deployment.name
    this.locked = deployment.locked
    this.devices = []
    for (let i = 0; i < devices.length; i++) {
      this.devices.push(new ApiDevice(devices[i], null, null))
    }
  }
}

export class ApiSummary {
  devices: string[]
  deployments: string[]

  constructor() {
    this.devices = []
    this.deployments = []
  }
}

export class ApiResult {
  code: number
  text: string

  constructor(c: number, t: string) {
    this.code = c
    this.text = t
  }
  send(res: NextApiResponse): NextApiResponse {
    res.status(this.code).send(this.text)
    return res
  }
  isOk(): boolean {
    return this.code == 200
  }
}
