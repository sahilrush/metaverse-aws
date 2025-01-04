
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken'; 
import client from "@repo/db/client";
import { SigninSchema, SignupSchema } from '../types';
import { JWT_PASSWORD } from '../config';
import { compare, hash } from '../types/scrpt';

export const signup = async (req: Request, res: Response): Promise<any> => {
    console.log(req.body)
    const parsedData = SignupSchema.safeParse(req.body)
    console.log("successfully parse the data with ",parsedData)
    if (!parsedData.success) {
        console.log("parsed data incorrect")
        res.status(400).json({message: "Validation failed"})
        return
    }

    const hashedPassword = await hash(parsedData.data.password)

    try {
         const existingUser = await client.user.findFirst({
            where:{
                username: parsedData.data.username
            }
            
         })

         if(existingUser)  return res.status(400).json({error:"user already exists"})

        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.role === "admin" ? "Admin" : "User",
            }
        })
    
        return res.status(200).json({
            userId: user.id
            
        })
    } catch(e) {
        console.log("erroer thrown")
        console.log(e)
        res.status(400).json({message: "User already exists"})
    }
}



export const signin = async(req: Request, res: Response):Promise<any> => {  
    console.log(req.body)
    const parsedData = SigninSchema.safeParse(req.body)
    if (!parsedData.success) {
        res.status(403).json({message: "Validation failed"})
        return
    }

    try {
        const user = await client.user.findUnique({
            where: {
                username: parsedData.data.username
            }
        })
        
        if (!user) {
            res.status(403).json({message: "User not found"})
            return
        }
        const isValid = await compare(parsedData.data.password, user.password)

        if (!isValid) {
            res.status(403).json({message: "Invalid password"})
            return
        }

        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_PASSWORD);

        return  res.status(200).json({
            token
        })
    } catch(e) {
        res.status(400).json({message: "Internal server error"})
    }
}