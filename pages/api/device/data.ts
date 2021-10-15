import { NextApiRequest, NextApiResponse } from 'next'

import { InternalDevice, ApiResult} from '../../../lib/types'
import { prisma } from '../../../lib/db'
import { checkDeviceAuth } from '../../../lib/device'

//// Arguements
  //  mac: 12 hex digits identifying the connecting device
  //  password: device password
  //  data: data to save, formated as commas seperated list
  //    EXAMPLE 'lux=0.0,temperature=0.0,pressure=0.0,humidity=0.0'
//// Return
  //  result message

export default async (req: NextApiRequest, res: NextApiResponse) => {
  let result = await checkDeviceAuth(req)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof InternalDevice) {
    if (req.query.data == null) {
      return res.status(400).send("Data required")
    }
    let data: { [key: string]: string } = {}
    req.query.data.toString().split(",").forEach((text) => {
      let pair = text.split("=")
      if (pair.length != 2) {
        return res.status(400).send(`Invalid data '${text}'`)
      }
      data[pair[0]] = pair[1]
    })
    let values = ['lux', 'temperature', 'pressure', 'humidity']
    for (let i = 0; i < values.length; i++) {
      if (data[values[i]] == null) {
        return new ApiResult(400, `Missing data value '${values[i]}'`)
      }
    }
    await prisma.data.upsert({
      where: {
        mac: result.mac,
      },
      update: {
        lux: data['lux'],
        temperature: data['temperature'],
        pressure: data['pressure'],
        humidity: data['humidity'],
      },
      create: {
        mac: result.mac,
        lux: data['lux'],
        temperature: data['temperature'],
        pressure: data['pressure'],
        humidity: data['humidity'],
      }
    })
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
}
