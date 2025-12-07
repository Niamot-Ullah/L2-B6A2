import express, { Request, Response } from "express"
import { bookingControllers } from "./booking.controller";
import auth from "../../middleware/auth";
import { UserRole } from "../../types/auth";


const router = express.Router()

router.post('/',auth(UserRole.Admin, UserRole.Customer),bookingControllers.createBooking)
router.get('/',auth(UserRole.Admin,UserRole.Customer), bookingControllers.getBooking)
router.put('/:bookingId',auth(UserRole.Admin, UserRole.Customer),bookingControllers.updateBooking)




export const bookingRoutes = router