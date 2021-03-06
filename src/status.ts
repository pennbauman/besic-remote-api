import express, { Application, Request, Response } from 'express'

import { ApiDevice, ApiBox, ApiSummary, ApiAll, ApiResult } from '../lib/types'
import * as db from '../lib/db'


const app = express();
app.use(express.json()) // application/json
app.use(express.urlencoded({ extended: true })) // application/x-www-form-urlencoded



/////////////////////////////////////////////////////////
//
//  API/status/all
//
//// No Arguements
//// Return
  //  ApiAll {
  //    undeployed: array [
  //      ApiDevice {
  //        type: device type ('RELAY' or 'BASESTATION')
  //        mac: 12 hex digits of device mac
  //        nickname: OPTIONAL device nickname
  //        last_seen: time device was last seen
  //        addr: IP address device was last seen at
  //        data: ApiData { // OPTIONAL
  //          lux: last lux data reading
  //          tmp: last temperature data reading
  //          prs: last pressure data reading
  //          hum: last humidity data reading
  //        }
  //      }
  //    ]
  //    boxes: array [
  //      ApiBox {
  //        name: box name
  //        devices: array [
  //          ApiDevice {
  //            box: box name
  //            type: device type ('RELAY' or 'BASESTATION')
  //            relay_id: device id within box (int)
  //            mac: 12 hex digits of device mac
  //            nickname: OPTIONAL device nickname
  //            last_seen: time device was last seen
  //            addr: IP address device was last seen at
  //            data: { // OPTIONAL
  //              lux: last lux data reading
  //              tmp: last temperature data reading
  //              prs: last pressure data reading
  //              hum: last humidity data reading
  //            }
  //          }
  //        ]
  //      }
  //    ]
  //  }
app.get('/all', async (req: Request, res: Response) => {
  let result = await db.getAllObj()
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiAll) {
    return res.status(200).send(result)
  } else {
    return res.status(500).send("default")
  }
});


/////////////////////////////////////////////////////////
//
//  API/status/box
//
//// Arguements
  //  name: name identifying box to query about
//// Return
  //  ApiBox {
  //    name: box name
  //    device: array [
  //      ApiDevice {
  //        box: box name
  //        type: device type ('RELAY' or 'BASESTATION')
  //        relay_id: device id within box (int)
  //        mac: 12 hex digits of device mac
  //        nickname: OPTIONAL device nickname
  //        last_seen: time device was last seen
  //        addr: IP address device was last seen at
  //        data: { // OPTIONAL
  //          lux: last lux data reading
  //          tmp: last temperature data reading
  //          prs: last pressure data reading
  //          hum: last humidity data reading
  //        }
  //      }
  //    ]
  //  }
app.get('/box', async (req: Request, res: Response) => {
  if (req.query.name == null) {
    return res.status(400).send("Name required")
  }
  let result = await db.getBoxObj(req.query.name.toString())
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiBox) {
    return res.status(200).send(result)
  } else {
    return res.status(500).send("default")
  }
});


/////////////////////////////////////////////////////////
//
//  API/status/device
//
//// Arguements
  //  mac: 12 hex digits identifying device to query about
//// Return
  //  ApiDevice {
  //    box: OPTIONAL box name
  //    type: device type ('RELAY' or 'BASESTATION')
  //    relay_id: OPTIONAL device id within box (int)
  //    mac: 12 hex digits of device mac
  //    nickname: OPTIONAL device nickname
  //    last_seen: time device was last seen
  //    addr: IP address device was last seen at
  //    data: ApiData { // OPTIONAL
  //      lux: last lux data reading
  //      tmp: last temperature data reading
  //      prs: last pressure data reading
  //      hum: last humidity data reading
  //    }
  //    log: array [
  //      ApiLog {
  //        timestamp: time of event
  //        event: event that occured with device ('found' or 'lost')
  //      }
  //    ]
  //  }
app.get('/device', async (req: Request, res: Response) => {
  if (req.query.mac == null) {
    return res.status(400).send("MAC required")
  }
  let result = await db.getDeviceObj(req.query.mac.toString())
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiDevice) {
    return res.status(200).send(result)
  } else {
    return res.status(500).send("default")
  }
});


/////////////////////////////////////////////////////////
//
//  API/status/summary
//
//// No Arguements
//// Return
  //  ApiSummary {
  //    devices: array [
  //      string: device mac
  //    ]
  //    boxes: array [
  //      string: box name
  //    ]
  //  }
app.get('/device', async (req: Request, res: Response) => {
  let result = await db.getSummaryObj()
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (result instanceof ApiSummary) {
    return res.status(200).send(result)
  } else {
    return res.status(500).send("default")
  }
});


/////////////////////////////////////////////////////////
//
//  API/status/unboxed
//
//// Return
  //  device: array [
  //    ApiDevice {
  //      type: device type ('RELAY' or 'BASESTATION')
  //      mac: 12 hex digits of device mac
  //      nickname: OPTIONAL device nickname
  //      last_seen: time device was last seen
  //      addr: IP address device was last seen at
  //      data: ApiData { // OPTIONAL
  //        lux: last lux data reading
  //        tmp: last temperature data reading
  //        prs: last pressure data reading
  //        hum: last humidity data reading
  //      }
  //    }
  //  ]
app.get('/unboxed', async (req: Request, res: Response) => {
  let result = await db.getUnboxedDevicesArr()
  if (result instanceof ApiResult) {
    return result.send(res)
  } else if (Array.isArray(result)) {
    return res.status(200).send(result)
  } else {
    return res.status(500).send("default")
  }
});

export default app;
