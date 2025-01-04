import  { Router } from "express"
import { userMiddleware } from "../middleware/user";
import {  addElementtoSpace, createSpace, deleteElement, deleteSpace, getAllSpaces,  getSpaceElementsbyId } from "../actions/space";


export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, createSpace)
spaceRouter.delete("/element", userMiddleware, deleteElement)
spaceRouter.delete("/:spaceId", userMiddleware, deleteSpace)
spaceRouter.get("/all", userMiddleware, getAllSpaces)
spaceRouter.get("/:spaceId",getSpaceElementsbyId)
spaceRouter.post("/element", userMiddleware, addElementtoSpace)

