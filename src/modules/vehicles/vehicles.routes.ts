import express, { Request, Response } from "express"
import { pool } from "../../config/db";
import { vehicleControllers } from "./vehicles.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../types/auth";

const router= express.Router()


router.post("/",auth(UserRole.Admin),vehicleControllers.createVehicle)
router.get('/',vehicleControllers.getVehicle)
router.get("/:vehicleId",vehicleControllers.getSingleVehicle)
router.put('/:vehicleId',auth(UserRole.Admin), vehicleControllers.updateVehicle)
router.delete('/:vehicleId',auth(UserRole.Admin),vehicleControllers.deleteVehicle)


export const vehiclesRoutes = router;