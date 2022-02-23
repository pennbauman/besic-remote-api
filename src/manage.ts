import express, { Application, Request, Response } from 'express'

import { ApiDevice, ApiDeployment, ApiSummary, ApiAll, ApiResult } from '../lib/types'
import { checkManageAuth } from '../lib/manage'
import { prisma, NAME_REGEX } from '../lib/db'
import * as db from '../lib/db'


const app = express();
app.use(express.json()) // application/json
app.use(express.urlencoded({ extended: true })) // application/x-www-form-urlencoded



/////////////////////////////////////////////////////////
//
//  API/manage/device/delete
//
//// Arguements
  //  mac: 12 hex digits identifying device to delete
//// Return
  //  result message
  //
app.get('/device/delete', async (req: Request, res: Response) => {
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  let result = await db.getDeviceObj(req.body.mac)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiDevice) {
    if (result.deployment) {
      return res.status(405).send("Device deployed")
    }
    await prisma.$transaction([
      prisma.log.deleteMany({
        where: { mac: req.body.mac },
      }),
      prisma.data.deleteMany({
        where: { mac: req.body.mac },
      }),
      prisma.device.delete({
        where: { mac: req.body.mac },
      }),
    ])
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
});


/////////////////////////////////////////////////////////
//
//  API/manage/device/nickname
//
//// Arguements
  //  mac: 12 hex digits identifying device to nickname
  //  nickname: nickname to give device
//// Return
  //  result message
  //
app.get('/device/nickname', async (req: Request, res: Response) => {
  if (req.body.nickname == null) {
    return res.status(400).send("Nickname required")
  }
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  if (!NAME_REGEX.test(req.body.nickname)) {
    return res.status(400).send("Invalid nickname")
  }
  let result = await db.getDeviceObj(req.body.mac)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiDevice) {
    await prisma.device.update({
      where: { mac: req.body.mac},
      data: { nickname: req.body.nickname }
    })
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
});


/////////////////////////////////////////////////////////
//
//  API/manage/device/insert
//
//// Arguements
  //  name: name identifying deployment to insert into
  //  mac: 12 hex digits identifying device to insert
  //  id: OPTIONAL id to insert device with
  //    NOTE has not effect on basestations which always have relay_id = 0
//// Return
  //  result message
  //
app.get('/device/insert', async (req: Request, res: Response) => {
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  let deployment = await db.getDeploymentObj(req.body.name)
  if (deployment instanceof ApiResult) {
    return deployment.send(res)
  } else if (deployment instanceof ApiDeployment) {
    let device = await db.getDeviceObj(req.body.mac)
    if (device instanceof ApiResult) {
      return device.send(res)
    } else if (device instanceof ApiDevice) {
      if (device.deployment) {
        return res.status(405).send("Device already deployed")
      }
      let id = 0
      if (req.body.id) {
        let num = Number(req.body.id)
        if (isNaN(num) || num < 0) {
          return res.status(400).send("Invalid ID")
        }
        for (let i = 0; i < deployment.devices.length; i++) {
          if (deployment.devices[i].relay_id == num) {
            return res.status(406).send("ID already used in deployment")
          }
        }
        id = num
      } else {
        let ids = []
        for (let i = 0; i < deployment.devices.length; i++) {
          ids.push(deployment.devices[i].relay_id)
        }
        ids.sort();
        let num = device.type == "RELAY" ? 1 : 0
        for (let i = 0; i < ids.length; i++) {
          if (num < ids[i]) {
            break
          }
          if (num == ids[i]) {
            num++
          }
        }
        id = num
      }
      await prisma.device.update({
        where: { mac: req.body.mac },
        data: {
          deployment: req.body.name,
          relay_id: id,
        }
      })
      return res.status(200).send("Success")
    } else {
      return res.status(500).send("default")
    }
  } else {
    return res.status(500).send("default")
  }
});


/////////////////////////////////////////////////////////
//
//  API/manage/device/remove
//
//// Arguements
  //  name: name identifying deployment to remove from
  //  mac: 12 hex digits identifying device to remove
//// Return
  //  result message
  //
app.get('/device/remove', async (req: Request, res: Response) => {
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  let deployment = await db.getDeploymentObj(req.body.name)
  if (deployment instanceof ApiResult) {
    return deployment.send(res)
  } else if (deployment instanceof ApiDeployment) {
    let device = await db.getDeviceObj(req.body.mac)
    if (device instanceof ApiResult) {
      return device.send(res)
    } else if (device instanceof ApiDevice) {
      for (let i = 0; i < deployment.devices.length; i++) {
        if (deployment.devices[i].mac == req.body.mac) {
          await prisma.device.update({
            where: { mac: req.body.mac },
            data: {
              deployment: null,
              relay_id: null,
            }
          })
          return res.status(200).send("Success")
        }
      }
      return res.status(404).send("Device not in deployment")
    } else {
      return res.status(500).send("default")
    }
  } else {
    return res.status(500).send("default")
  }
});


/////////////////////////////////////////////////////////
//
//  API/manage/device/renumber
//
//// Arguements
  //  name: name identifying deployment to modify
  //  mac: 12 hex digits identifying device to modify
  //    NOTE basestation was have relay_id 0 and cannot be renumber
  //  id: new id for modified device
//// Return
  //  result message
  //
app.get('/device/renumber', async (req: Request, res: Response) => {
  if (req.body.id == null) {
    return res.status(400).send("ID required")
  }
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  let deployment = await db.getDeploymentObj(req.body.name)
  if (deployment instanceof ApiResult) {
    return deployment.send(res)
  } else if (deployment instanceof ApiDeployment) {
    let device = await db.getDeviceObj(req.body.mac)
    if (device instanceof ApiResult) {
      return device.send(res)
    } else if (device instanceof ApiDevice) {
      if (device.deployment != req.body.name) {
        return res.status(404).send("Device not in deployment")
      }
      let id = Number(req.body.id)
      if (isNaN(id) || id < 0) {
        return res.status(400).send("Invalid ID")
      }
      for (let i = 0; i < deployment.devices.length; i++) {
        if (deployment.devices[i].relay_id == id) {
          return res.status(406).send("ID already used in deployment")
        }
      }
      await prisma.device.update({
        where: { mac: req.body.mac },
        data: {
          relay_id: id,
        }
      })
      return res.status(200).send("Success")
    } else {
      return res.status(500).send("default")
    }
  } else {
    return res.status(500).send("default")
  }
});



/////////////////////////////////////////////////////////
//
/////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////
//
//  API/manage/deployment/new
//
//// Arguements
  //  name: name identifying deployment to create
//// Return
  //  result message
  //
app.get('/deployment/new', async (req: Request, res: Response) => {
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  if (req.body.name == null) {
    return res.status(400).send("Name required")
  }
  if (!NAME_REGEX.test(req.body.name)) {
    return res.status(400).send("Invalid name")
  }
  try {
    let result = await prisma.deployment.create({
      data: {
        name: req.body.name,
        locked: false,
      }
    })
  } catch (err) {
    if (err.code == 'P2002') {
      return res.status(406).send("Duplicate deployment")
    }
    console.log("NEW ERR: ", err)
  }
  return res.status(200).send("Success")
});


/////////////////////////////////////////////////////////
//
//  API/manage/deployment/delete
//
//// Arguements
  //  name: name identifying deployment to delete
//// Return
  //  result message
  //
app.get('/deployment/delete', async (req: Request, res: Response) => {
  if (!checkManageAuth(req)) {
    return res.status(401).send("Unauthorized")
  }
  let result = await db.getDeploymentObj(req.body.name)
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiDeployment) {
    if (result.devices.length > 0) {
      return res.status(405).send("Deployment has devices")
    }
    await prisma.deployment.delete({
      where: { name: req.body.name},
    })
    return res.status(200).send("Success")
  } else {
    return res.status(500).send("default")
  }
});

export default app;
