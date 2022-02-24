import { Response } from 'express';
import * as Prisma from '@prisma/client'

type DeviceWithData = Prisma.Device & { data: Prisma.Data }

export class InternalDevice {
  box?: string
  type: Prisma.DeviceType
  relay_id?: number
  mac: string
  nickname?: string
  last_seen: Date
  addr: string

  constructor(device: Prisma.Device) {
    if (device.box != null) {
      this.box = device.box
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
      this.tmp = data.tmp
      this.prs = data.prs
      this.hum = data.hum
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
  box?: string
  type: Prisma.DeviceType
  relay_id?: number
  mac: string
  nickname?: string
  last_seen: Date
  addr: string
  data: ApiData
  log?: ApiLog[]

  constructor(device: Prisma.Device, data: Prisma.Data, log: Prisma.Log[]) {
    if (device.box != null) {
      this.box = device.box
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

export class ApiBox {
  name: string
  locked: boolean
  devices: ApiDevice[]

  constructor(box: Prisma.Box, devices: DeviceWithData[]) {
    this.name = box.name
    this.devices = []
    for (let i = 0; i < devices.length; i++) {
      this.devices.push(new ApiDevice(devices[i], devices[i].data, null))
    }
  }
}

export class ApiSummary {
  devices: string[]
  boxes: string[]

  constructor() {
    this.devices = []
    this.boxes = []
  }
}

export class ApiAll {
  undeployed: ApiDevice[]
  boxes: ApiBox[]

  constructor() {
    this.undeployed = []
    this.boxes = []
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
