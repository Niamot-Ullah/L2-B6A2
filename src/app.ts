import express, { NextFunction, Request, Response } from "express";
import config from "./config";
import initDB, { pool } from "./config/db";
import logger from "./middleware/logger";
import { userRoutes } from "./modules/users/users.routes";
import { vehiclesRoutes } from "./modules/vehicles/vehicles.routes";
import { bookingRoutes } from "./modules/bookings/booking.route";
import { authRoutes } from "./modules/auth/auth.routes";

const app = express();
app.use(express.json());

//db
initDB();

// server -> route-> controller -> services

//root route
app.get("/",logger, (req: Request, res: Response) => {
  res.status(200).json({
    message: "this is root",
  });
});

//user crud
app.use("/api/v1/users", userRoutes)
// vehicle crud
app.use("/api/v1/vehicles",vehiclesRoutes);
//booking crud
app.use("/api/v1/bookings", bookingRoutes);
//auth route
app.use("/api/v1/auth",authRoutes)


//error route handler
app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:"Route not found",
        path:req.path
    })
})


export default app

