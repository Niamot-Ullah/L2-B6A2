import { pool } from "../../config/db";
import { User, UserRole } from "../../types/auth";

const createBookingDB = async(customer_id:any, vehicle_id:any, rent_start_date:any, rent_end_date:any, totalPrice:any)=>{
    const result = await pool.query(
      `INSERT INTO bookings( customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
    );
    return result
}

const getBookingDB = async(payload: Record<string,any>)=>{
    const user: User = payload.user;
    console.log(user);

  if (user.role === UserRole.Admin) {
    const result = await pool.query(
      `SELECT id, customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings`
    );
    return result;
  }

  const result = await pool.query(
    `SELECT id,customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status FROM bookings WHERE customer_id = $1`,
    [user.id]
  );

  return result;
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

    updateBookingDB
}