import { NextFunction } from "express";
import { Request, Response } from "express";    
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";


export const userMiddleware = (req: Request, res: Response, next: NextFunction) => { 
        
  const header = req.headers["authorization"];
  const token = header?.split(" ")[1];

  if(!token) {
    res.status(403).json({
      messagge: "Unauthorized"  

    })
    return;
  }

  try {
    console.log("token not giving error i")
    const decoded = jwt.verify(token, JWT_PASSWORD)as {role: string, userId:string};
    console.log("token verified ans i d",decoded)
    req.userId = decoded.userId;
    next();
  } catch(e) {
    console.log("error is there ",e)
    res.status(403).json({
      message: "Unauthorized"
    })  
    return
  }
}