import { NextApiRequest, NextApiResponse } from 'next'
import * as Prisma from '@prisma/client'

import { ApiResult} from '../../../../lib/types'
import { prisma, NAME_REGEX } from '../../../../lib/db'
import { checkManageAuth } from '../../../../lib/manage'

//// Arguements
  //  name: name identifying deployment to create
//// Return
  //  result message

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (Array.isArray(req.body.name)) {
    return res.status(400).send("Invalid name")
  }
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
}
