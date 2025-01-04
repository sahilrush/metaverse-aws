import client from "@repo/db/client"
import { Request, Response } from "express"

export const getAllavatars = async (req: Request, res: Response) => {
  const avatars = await client.avatar.findMany()
  res.status(200).json({avatars: avatars.map(x => ({
      id: x.id,
      imageUrl: x.imageUrl,
      name: x.name
  }))})
}