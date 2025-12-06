import express, { NextFunction, Request, Response } from "express";
import config from "./config";
import initDB, { pool } from "./config/db";
import logger from "./middleware/logger";
import { userRoutes } from "./modules/users/users.routes";
import { vehiclesRoutes } from "./modules/vehicles/vehicles.routes";
import { bookingRoutes } from "./modules/bookings/booking.route";

const app = express();
const port = config.port;
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
// app.get("/api/v1/users", );
// app.get("/api/v1/users/:userId", );
// app.put("/api/v1/users/:userId", );
// app.delete("/api/v1/users/:userId", );



// vehicle crud
app.use("/api/v1/vehicles",vehiclesRoutes);
// app.post("/api/v1/vehicles",);
// app.get("/api/v1/vehicles",);
// app.get("/api/v1/vehicles/:vehicleId", );
// app.put("/api/v1/vehicles/:vehicleId",);
// app.delete("/api/v1/vehicles/:vehicleId",);


//booking crud
app.use("/api/v1/bookings", bookingRoutes);
// app.post("/api/v1/bookings", );

// app.get("/api/v1/bookings", );

// app.get("/api/v1/bookings/:bookingId", );

// app.put("/api/v1/bookings/:bookingId", );




app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:"Route not found",
        path:req.path
    })
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
