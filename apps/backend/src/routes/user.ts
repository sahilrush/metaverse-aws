import express, { Router } from 'express'
import { userMiddleware } from '../middleware/user'
import { getbulkMetaData, UpdateMetadata } from '../actions/user'
import { updateElement } from '../actions/admin'
export const userRouter = Router()

userRouter.post("/metadata",userMiddleware,UpdateMetadata)
userRouter.get("/metadata/bulk",getbulkMetaData)




