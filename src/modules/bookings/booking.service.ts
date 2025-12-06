import { pool } from "../../config/db";

const createBookingDB = async(customer_id:any, vehicle_id:any, rent_start_date:any, rent_end_date:any, totalPrice:any)=>{
    const result = await pool.query(
      `INSERT INTO bookings( customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
    );
    return result
}

const getBookingDB = async()=>{
    const result = await pool.query(`SELECT * FROM bookings`);
    return result
}

const getSingleBookingDB = async(id:any)=>{
    const result = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [id]);
    return result
}

const updateBookingDB = async(id:any)=>{
    const bookingResult = await pool.query(
        `SELECT * FROM bookings WHERE id=$1`,[id]
    )
    return bookingResult
}








export const bookingService = {
    createBookingDB,
    getBookingDB,
    getSingleBookingDB,
    updateBookingDB
}