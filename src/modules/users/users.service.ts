import { pool } from "../../config/db";


const createUserDB = async(name:string, email:string, password:string, phone:string, role:string)=>{
    const result = await pool.query(
          `INSERT INTO users(name, email, password, phone, role) VALUES($1,LOWER($2),$3,$4,$5) RETURNING *`,
          [name, email, password, phone, role]
        );

        return result
}

const getUserDB = async()=>{
    const result = await pool.query(`SELECT * FROM users`)
    return result
}

const getSingleUserDB = async(id:any)=>{
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
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
    createUserDB,
    getUserDB,
    getSingleUserDB,
    updateUserDB,
    deleteUserDB


}