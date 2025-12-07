import { pool } from "../../config/db";
import bcrypt from "bcryptjs";




const getUserDB = async()=>{
    const result = await pool.query(`SELECT id,name,email,phone,role FROM users`)
    return result
}

const updateUserDB = async(name:string, email:string, phone:string, role:string, id:any)=>{
    const result = await pool.query(
      `UPDATE users SET name=$1,email=$2,phone=$3,role=$4 WHERE id=$5 RETURNING *`,
      [name, email, phone, role, id]
    );
   return result
}
const deleteUserDB = async(id:any)=>{
    const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
    return result
}





export const userServices = {
    getUserDB,
    updateUserDB,
    deleteUserDB


}