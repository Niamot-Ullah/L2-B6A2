import { Request, Response } from "express";
import { pool } from "../../config/db";
import { userServices } from "./users.service";




const getUser = async (req: Request, res: Response) => {
  try {
    const result =await userServices.getUserDB();
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
const UpdateUser = async (req: Request, res: Response) => {
  const { name, email, phone, role } = req.body;
  const id = req.params.userId;

  try {

    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be admin or customer",
      });
    }
   
    const result = await userServices.updateUserDB(name, email, phone, role, id)
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
const deleteUser = async (req: Request, res: Response) => {
  const id = req.params.userId;
  try {
    const userBooking = await pool.query(
        `SELECT * FROM bookings WHERE customer_id=$1`,[id]
    )
    if(userBooking.rows.length > 0){
        return res.status(400).json({
        success: false,
        message: "Can't delete user because he has bookings",
    })
    }

    const result = await userServices.deleteUserDB(id);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "user not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User deleted successfully"
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}




export const userControllers = {
    getUser,
    UpdateUser,
    deleteUser
}