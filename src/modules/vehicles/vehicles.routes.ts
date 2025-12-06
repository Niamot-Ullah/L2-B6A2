import express, { Request, Response } from "express"
import { pool } from "../../config/db";
import { vehicleControllers } from "./vehicles.controller";

const router= express.Router()


router.post("/",vehicleControllers.createVehicle)

router.get('/', vehicleControllers.getVehicle)

router.get("/vehicleId",vehicleControllers.getSingleVehicle)

router.put('/vehicleId', vehicleControllers.updateVehicle)

router.delete('/vehicleId', vehicleControllers.deleteVehicle)


export const vehiclesRoutes = router;