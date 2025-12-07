import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../config";

const signUpUserDB = async (
  name: string,
  email: string,
  password: string,
  phone: string,
  role: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users(name, email, password, phone, role) VALUES($1,LOWER($2),$3,$4,$5) RETURNING *`,
    [name, email, hashedPassword, phone, role]
  );

  return result;
};

const signInUserDB = async (id:any,email: string, password: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    return false;
  }

  // payload -> secret -> expire time
  const token = jwt.sign(
    {
      id:user?.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    config.jwtSecret as string,
    { expiresIn: "7d" }
  );
  console.log({ token });
  delete user.password;
  return { token, user };
};

export const authService = {
  signUpUserDB,
  signInUserDB,
};
