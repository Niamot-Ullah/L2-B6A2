import { Request, Response } from "express";
import { authService } from "./auth.service";

const signUpUser = async (req: Request, res: Response) => {
  const { name, email, password, phone, role } = req.body;
  try {
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be admin or customer",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    const result = await authService.signUpUserDB(
      name,
      email,
      password,
      phone,
      role
    );
    res.status(201).json({
      success: true,
      message: "user created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const signInUser = async (req: Request, res: Response) => {
  const {id, email, password } = req.body;
  console.log(req.body);
  try {
    const result = await authService.signInUserDB(id,email, password);
    res.status(200).json({
      success: true,
      message: "login successful",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const authControllers = {
  signUpUser,
  signInUser
};
