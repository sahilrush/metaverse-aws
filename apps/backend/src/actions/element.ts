import client from "@repo/db/client"
import { Request, Response } from "express"



  export const getAllelements = async(req: Request, res: Response) => {
    const elements = await client.element.findMany()

    res.status(200).json({elements: elements.map(e => ({
        id: e.id,
        imageUrl: e.imageUrl,
        width: e.width,
        height: e.height,
        static: e.static
    }))})
}