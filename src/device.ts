import express, { Application, Request, Response } from 'express'
import * as bcrypt from 'bcrypt'

import { prisma, MAC_REGEX } from '../lib/db'
import { InternalDevice, ApiResult} from '../lib/types'
import { checkDeviceAuth } from '../lib/device'


//export const register = ( app: Application ) => {
const app = express();
app.use(express.json()) // application/json
app.use(express.urlencoded({ extended: true })) // application/x-www-form-urlencoded



/////////////////////////////////////////////////////////
//
//  API/device/new
//
//// Arguements
  //  mac: 12 hex digits identifying the device to create
  //  password: device password
  //  type: device type ('RELAY' or 'BASESTATION')
//// Return
  //  result message
app.post('/new', async (req: Request, res: Response) => {
  if (req.body.mac == null) {
    return res.status(400).send("MAC required")
  }
  if (!Array.isArray(req.body.mac) && !MAC_REGEX.test(req.body.mac)) {
    return res.status(400).send("Invalid MAC")
  }
  if (req.body.password == null) {
    return res.status(400).send("Password required")
  }
  if (Array.isArray(req.body.password)) {
    return res.status(400).send("Invalid password (Array)")
  }
  if (req.body.type == null) {
    return res.status(400).send("Type required")
  }
  if (req.body.type != "RELAY" && req.body.type != "BASESTATION") {
    return res.status(400).send("Invalid type")
  }
  let salt = await bcrypt.genSalt(8)
  let time = new Date(Date.now())
  try {
    let result = await prisma.device.create({
      data: {
        type: req.body.type,
        mac: req.body.mac.toString(),
        last_seen: time.toISOString(),
        addr: req.ip,
        password: await bcrypt.hash(req.body.password, salt),
      }
    })
  } catch (err) {
    if (err.code == 'P2002') {
      let prev = await prisma.device.findUnique({
        where: { mac: req.body.mac.toString() }
      })
      if (prev.deployment == null) {
        await prisma.device.update({
          where: { mac: req.body.mac.toString() },
          data: {
            type: req.body.type,
            mac: req.body.mac.toString(),
            last_seen: time.toISOString(),
            addr: req.ip,
            password: await bcrypt.hash(req.body.password, salt),
          }
        })
      } else {
        return res.status(406).send("Duplicate device")
      }
    }
    console.log("NEW ERR: ", err)
  }
  return res.status(200).send("Success")
});


/////////////////////////////////////////////////////////
//
//  API/device/heartbeat
//
//// Arguements
  //  mac: 12 hex digits identifying the connecting device
  //  password: device password
//// Return
  //  result message
app.post('/heartbeat', async (req: Request, res: Response) => {
  let result = await checkDeviceAuth(req)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof InternalDevice) {
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
});


/////////////////////////////////////////////////////////
//
//  API/device/deployment
//
//// Arguements
  //  mac: 12 hex digits identifying the connecting device
  //  password: device password
//// Return
  //  ENV file with device deployment info (deploy.conf)
  //    ''
  //    DEPLOYMENT_NAME="name"
  //    RELAY_ID="0"
  //    ''
app.post('/deployment', async (req: Request, res: Response) => {
  let result = await checkDeviceAuth(req)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof InternalDevice) {
    let deployment_conf = ""
    if (result.deployment) {
      deployment_conf += `DEPLOYMENT_NAME="${result.deployment}"\n`
    } else {
      deployment_conf += `DEPLOYMENT_NAME=""\n`
    }
    if (result.relay_id) {
      deployment_conf += `RELAY_ID="${result.relay_id}"\n`
    } else {
      deployment_conf += `RELAY_ID=""\n`
    }
    return res.status(200).send(deployment_conf)
  } else {
    return res.status(500).send("default")
  }
});


/////////////////////////////////////////////////////////
//
//  API/device/data
//
//// Arguements
  //  mac: 12 hex digits identifying the connecting device
  //  password: device password
  //  data: data to save, formated as commas seperated list
  //    EXAMPLE 'lux=0.0,tmp=0.0,prs=0.0,hum=0.0'
//// Return
  //  result message
app.post('/data', async (req: Request, res: Response) => {
  let result = await checkDeviceAuth(req)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof InternalDevice) {
    if (req.body.data == null) {
      return res.status(400).send("Data required")
    }
    let values = ['lux', 'tmp', 'prs', 'hum']
    for (let i = 0; i < values.length; i++) {
      if (req.body.data[values[i]] == null) {
        return new ApiResult(400, `Missing data value '${values[i]}'`)
      }
    }
    await prisma.data.upsert({
      where: {
        mac: result.mac,
      },
      update: {
        lux: req.body.data['lux'].toString(),
        temperature: req.body.data['tmp'].toString(),
        pressure: req.body.data['prs'].toString(),
        humidity: req.body.data['hum'].toString(),
      },
      create: {
        mac: result.mac,
        lux: req.body.data['lux'].toString(),
        temperature: req.body.data['tmp'].toString(),
        pressure: req.body.data['prs'].toString(),
        humidity: req.body.data['hum'].toString(),
      }
    })
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
});

export default app;
//}; // export
