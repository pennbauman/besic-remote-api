import { Response } from 'express';
import * as Prisma from '@prisma/client'

type DeviceWithData = Prisma.Device & { data: Prisma.Data }

export class InternalDevice {
  deployment?: string
  type: Prisma.DeviceType
  relay_id?: number
  mac: string
  nickname?: string
  last_seen: Date
  addr: string

  constructor(device: Prisma.Device) {
    if (device.deployment != null) {
      this.deployment = device.deployment
    }
    this.type = device.type
    if (device.relay_id != null) {
      this.relay_id = device.relay_id
    }
    this.mac = device.mac
    if (device.nickname != null) {
      this.nickname = device.nickname
    }
    this.last_seen = device.last_seen
    this.addr = device.addr
  }
}

export class ApiData {
  lux: string
  tmp: string
  prs: string
  hum: string

  constructor(data: Prisma.Data) {
    if (data != null) {
      this.lux = data.lux
      this.tmp = data.temperature
      this.prs = data.pressure
      this.hum = data.humidity
    }
  }
}

export class ApiLog {
  timestamp: Date
  event: string

  constructor(log: Prisma.Log) {
    this.timestamp = log.timestamp
    this.event = log.event
  }
}

export class ApiDevice {
  deployment?: string
  type: Prisma.DeviceType
  relay_id?: number
  mac: string
  nickname?: string
  last_seen: Date
  addr: string
  data: ApiData
  log?: ApiLog[]

  constructor(device: Prisma.Device, data: Prisma.Data, log: Prisma.Log[]) {
    if (device.deployment != null) {
      this.deployment = device.deployment
    }
    this.type = device.type
    if (device.relay_id != null) {
      this.relay_id = device.relay_id
    }
    this.mac = device.mac
    if (device.nickname != null) {
      this.nickname = device.nickname
    }
    this.last_seen = new Date(device.last_seen)
    this.addr = device.addr

    if (data != null) {
      this.data = new ApiData(data)
    }
    if (log != null) {
      this.log = []
      for (let i = 0; i < log.length; i++) {
        this.log.push(new ApiLog(log[i]))
      }
    }
  }
}

export class ApiDeployment {
  name: string
  locked: boolean
  devices: ApiDevice[]

  constructor(deployment: Prisma.Deployment, devices: DeviceWithData[]) {
    this.name = deployment.name
    this.locked = deployment.locked
    this.devices = []
    for (let i = 0; i < devices.length; i++) {
      this.devices.push(new ApiDevice(devices[i], devices[i].data, null))
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

export class ApiAll {
  undeployed: ApiDevice[]
  deployments: ApiDeployment[]

  constructor() {
    this.undeployed = []
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
  send(res: Response): Response {
    res.status(this.code).send(this.text)
    return res
  }
  isOk(): boolean {
    return this.code == 200
  }
}
