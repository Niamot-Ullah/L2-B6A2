import express, { Request, Response } from "express"
import { pool } from "../../config/db";
import { userControllers } from "./users.controller";

const router = express.Router();

router.post("/",userControllers.createUser)

router.get("/",userControllers.getUser)
//single user
router.get("/:userId",userControllers.getSingleUser)

router.put("/:userId",userControllers.UpdateUser)

router.delete("/:userId",userControllers.deleteUser)



export const userRoutes = router;






