import { Request, Response } from "express";
import { pool } from "../../config/db";
import { bookingService } from "./booking.service";


const createBooking =async (req: Request, res: Response) => {
  const {customer_id, vehicle_id, rent_start_date, rent_end_date} = req.body;

  try {
    // check the car exists or available
    const vehicleResult = await pool.query(
        `SELECT * FROM vehicles WHERE id=$1`,[vehicle_id]
    )
    if(vehicleResult.rows.length===0){
        return res.status(404).json({
            success:false,
            message:'vehicle is not found'
        })
    }
    const vehicle = vehicleResult.rows[0]
    if(vehicle.availability_status !== 'available'){
        return res.status(400).json({
            success:false,
            message:'vehicle is not available now'
        })
    }

    //calculate  duration
    const start = new Date(rent_start_date)
    const end = new Date(rent_end_date)

    const difference = end.getTime() - start.getTime()
    const days = difference / (1000*60*60*24)

    if(days<=0){
        return res.status(400).json({
            success:false,
            message:'End date must be after start date'
        })
    }

    //calculate total price
    const totalPrice = Number(vehicle.daily_rent_price) * days

    // create booking
    const result = await bookingService.createBookingDB(customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice)

    // update vehicle booked
    await pool.query(
        `UPDATE vehicles SET availability_status = 'booked' WHERE id=$1 `,[vehicle_id]
    )
    const addVehiclesData={
        "vehicle": {
      "vehicle_name": vehicle.vehicle_name,
      "daily_rent_price": vehicle.daily_rent_price
    }
    }
    const updatedData = {...result.rows[0],...addVehiclesData}
    // console.log(updatedData);

    res.status(201).json({
        success: true,
        message:'booking created successfully',
        data: updatedData,
        
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

const getBooking = async (req: Request, res: Response) => {
    const { role, customer_id } = req.query;

  try {
    const result = await bookingService.getBookingDB()
    res.status(200).json({
      success: true,
      message: "data fetched successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

const getSingleBooking = async (req: Request, res: Response) => {
  const id = req.params.bookingId;
  try {
    const result = await bookingService.getSingleBookingDB(id)

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "bookings not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "data fetched successfully",
        data: result.rows,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

const updateBooking = async (req: Request, res: Response) => {
  const {action,role} = req.body;
  const id = req.params.bookingId;

  try {

    const bookingResult = await bookingService.updateBookingDB(id)

    if(bookingResult.rows.length===0){
        return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const booking = bookingResult.rows[0]
    // console.log(booking);
    const today:any = new Date().toISOString().split('T')[0]

    // prevent multiple updates
    if (booking.status === "returned" || booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking already completed or cancelled",
      });
    }

    //system return
     if (booking.rent_end_date < today && booking.status !== "returned" && booking.status !== "cancelled") {
      await pool.query(
        `UPDATE bookings SET status = 'returned' WHERE id = $1`,
        [id]
      );

      await pool.query(
        `UPDATE vehicles SET availability_status = 'available' WHERE id = $1`,
        [booking.vehicle_id]
      );

      return res.json({
        success: true,
        message: "Booking period ended"
      });
    }

    //customer cancel booking
    if(role==='customer' && action==='cancelled'){

        if(today >=booking.rent_start_date){
          return res.status(400).json({
          success: false,
          message: "You can cancel only before start date"
        });
        }
        //update booking status
        await pool.query(
            `UPDATE bookings SET status='cancelled' WHERE id=$1`,[id]
        )
        // make available again
        await pool.query(
            `UPDATE vehicles SET availability_status='available' WHERE id=$1`,[booking.vehicle_id]
        )
        return res.json({
        success: true,
        message: "Booking cancelled successfully",
        data: booking
      });

    }
   
    //admin returned
    if(role==='admin'&& action==='returned'){
        await pool.query(
            `UPDATE bookings SET status='returned' WHERE id=$1`,[id]
        )
        await pool.query(
            `UPDATE vehicles SET availability_status='available' WHERE id=$1`,[booking.vehicle_id]
        )
       

        return res.json({
        success: true,
        message: "Booking marked as returned. Vehicle is now available",
        data: booking
      });
    }

     return res.status(400).json({
      success: false,
      message: "Invalid action or role not allowed"
    });




  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}




export const bookingControllers = {
    createBooking,
    getBooking,
    getSingleBooking,
    updateBooking
}