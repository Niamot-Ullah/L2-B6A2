import express, { Request, Response } from "express"
import { pool } from "../../config/db";
import { bookingControllers } from "./booking.controller";


const router = express.Router()

router.post('/',bookingControllers.createBooking)

router.get('/', bookingControllers.getBooking)

router.get('/:bookingId',bookingControllers.getSingleBooking)

router.put('/:bookingId',bookingControllers.updateBooking)


export const bookingRoutes = router