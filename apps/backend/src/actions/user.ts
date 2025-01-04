import { UpdateMetadataSchema } from "../types"
import { Request, Response } from "express" 
import client from "@repo/db/client"


export const UpdateMetadata = async(req:Request, res:Response) => {  
    const parsedData = UpdateMetadataSchema.safeParse(req.body)   
    console.log(parsedData)    
    if (!parsedData.success) {
        console.log("parsed data incorrect")
        res.status(403).json({message: "Validation failed"})
        return
    }

    // const existingAvatar = await client.avatar.findFirst({
    //     where:{
    //         id: parsedData.data.avatarId
    //     }
    // })

    // if(!existingAvatar){
    //     await client.avatar.create({
    //         data:{
    //             id:parsedData.data.avatarId,
    //             imageUrl:"",
    //             name:""
    //         }
    //     })
    // }

    try {
        await client.user.update({
            where: {
                id: req.userId
            },
            data: {
                avatarId: parsedData.data.avatarId
            }
        })
        res.status(200).json({message: "Metadata updated"})
    } catch(e) {
        console.log("error")
        res.status(400).json({message: "Internal server error"})
    }
}



export const getbulkMetaData = async(req:Request, res:Response) => {   
    const userIdString = (req.query.ids ?? "[]") as string;
    const userIds = (userIdString).slice(1, userIdString?.length - 1).split(",");
    console.log(userIds)
    const metadata = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        }, select: {
            avatar: true,
            id: true
        }
    })

    res.json({
        avatars: metadata.map(m => ({
            userId: m.id,
            avatarId: m.avatar?.imageUrl
        }))
    })
}