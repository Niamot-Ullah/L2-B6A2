import express, { Request, Response } from "express"
import { userControllers } from "./users.controller";
import auth from './../../middleware/auth';
import { UserRole } from "../../types/auth";

const router = express.Router();



router.get("/",auth(UserRole.Admin),userControllers.getUser)
router.put("/:userId",auth(UserRole.Admin,UserRole.Customer),userControllers.UpdateUser)
router.delete("/:userId",auth(UserRole.Admin),userControllers.deleteUser)



export const userRoutes = router;






