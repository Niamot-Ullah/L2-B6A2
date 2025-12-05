import express, { Request, Response } from "express";
import { Pool } from "pg";

const app = express();
app.use(express.json());
const port = 5000;

const pool = new Pool({
  connectionString: `postgresql://neondb_owner:npg_YV8NWh0CFPiT@ep-falling-cake-a8dbksv9-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require`,
});
const initDB = async () => {
  await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL CHECK (LENGTH(password)>=6),
        phone VARCHAR(20) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin','customer'))
        )
        `);
  await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        vehicle_name VARCHAR(100) NOT NULL,
        type VARCHAR(50) CHECK (type IN('car','bike','van','SUV')),
        registration_number VARCHAR(100) UNIQUE NOT NULL,
        daily_rent_price NUMERIC CHECK (daily_rent_price > 0) NOT NULL,
        availability_status VARCHAR(20) CHECK (availability_status IN ('available', 'booked'))
        )
        `);
  await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        customer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vehicle_id INT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
        rent_start_date DATE NOT NULL,
        rent_end_date DATE NOT NULL CHECK (rent_end_date > rent_start_date),
        total_price DECIMAL(10,2) NOT NULL CHECK(total_price > 0),
        status VARCHAR(20) NOT NULL CHECK (status IN ('active','cancelled','returned'))

        )
    `);
};
initDB();

//root route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "this is root",
  });
});


//user crud
app.post("/api/v1/users", async (req: Request, res: Response) => {
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
    const result = await pool.query(
      `INSERT INTO users(name, email, password, phone, role) VALUES($1,LOWER($2),$3,$4,$5) RETURNING *`,
      [name, email, password, phone, role]
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
});

app.get("/api/v1/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM users`);
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
});

app.get("/api/v1/users/:userId", async (req: Request, res: Response) => {
  const id = req.params.userId;
  console.log(id);
  try {
    const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "user not found",
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
});

app.put("/api/v1/users/:userId", async (req: Request, res: Response) => {
  const { name, email, phone, role } = req.body;
  const id = req.params.userId;

  try {

    if (!["admin", "customer"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be admin or customer",
      });
    }
   
    const result = await pool.query(
      `UPDATE users SET name=$1,email=$2,phone=$3,role=$4 WHERE id=$5 RETURNING *`,
      [name, email, phone, role, id]
    );
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
});

app.delete("/api/v1/users/:userId", async (req: Request, res: Response) => {
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

    const result = await pool.query(`DELETE FROM users WHERE id=$1`, [id]);
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
});



// vehicle crud
app.post("/api/v1/vehicles", async (req: Request, res: Response) => {
  const {vehicle_name,type,registration_number,daily_rent_price,availability_status} = req.body;

  try {
    if (!vehicle_name || !registration_number || !daily_rent_price) {
      return res.status(400).json({
        success: false,
        message:
          " 'vehicle name, registration number and daily rent price' fields are required",
      });
    }
    if (!["available", "booked"].includes(availability_status)) {
      return res.status(400).json({
        success: false,
        message: "Availability must be provided",
      });
    }
    if (!["car", "bike", "van", "SUV"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "car type must be 'car', 'bike', 'van' or 'SUV' ",
      });
    }
    console.log("hello");
    const result = await pool.query(
      `INSERT INTO vehicles( vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES($1,$2,$3,$4,$5) RETURNING *`,
      [vehicle_name,type,registration_number,daily_rent_price,availability_status]
    );
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/v1/vehicles", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT * FROM vehicles`);
    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result.rows,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/api/v1/vehicles/:vehicleId", async (req: Request, res: Response) => {
  const id = req.params.vehicleId;
  try {
    const result = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicles retrieved successfully",
        data: result.rows,
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.put("/api/v1/vehicles/:vehicleId", async (req: Request, res: Response) => {
  const {vehicle_name,type,registration_number,daily_rent_price,availability_status} = req.body;
  const id = req.params.vehicleId;
  try {
    if (!["available", "booked"].includes(availability_status)) {
      return res.status(400).json({
        success: false,
        message: "Availability must be provided",
      });
    }
    if (!["car", "bike", "van", "SUV"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "car type must be 'car', 'bike', 'van' or 'SUV' ",
      });
    }
    const result = await pool.query(
      `UPDATE vehicles SET vehicle_name=$1,type=$2,registration_number=$3, daily_rent_price=$4,availability_status=$5 WHERE id=$6 RETURNING *`,[vehicle_name,type,registration_number,daily_rent_price,availability_status,id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicle updated successfully",
        data: result.rows[0],
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.delete("/api/v1/vehicles/:vehicleId", async (req: Request, res: Response) => {
  const id = req.params.vehicleId;
  try {
    const result = await pool.query(`DELETE FROM vehicles WHERE id=$1`, [id]);
    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


//booking crud
app.post("/api/v1/bookings", async (req: Request, res: Response) => {
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
    const result = await pool.query(
      `INSERT INTO bookings( customer_id, vehicle_id, rent_start_date, rent_end_date, total_price, status) VALUES($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [customer_id, vehicle_id, rent_start_date, rent_end_date, totalPrice]
    );

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
});

app.get("/api/v1/bookings", async (req: Request, res: Response) => {
    const { role, customer_id } = req.query;
  try {
    const result = await pool.query(`SELECT * FROM bookings`);
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
});

app.get("/api/v1/bookings/:bookingId", async (req: Request, res: Response) => {
  const id = req.params.bookingId;
  try {
    const result = await pool.query(`SELECT * FROM bookings WHERE id = $1`, [id]);

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
});

app.put("/api/v1/bookings/:bookingId", async (req: Request, res: Response) => {
  const {action,role} = req.body;
  const id = req.params.bookingId;

  try {
    const bookingResult = await pool.query(
        `SELECT * FROM bookings WHERE id=$1`,[id]
    )
    if(bookingResult.rows.length===0){
        return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    const booking = bookingResult.rows[0]
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
    if(role==='customer' && action==='cancel'){

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
        message: "Booking cancelled successfully"
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
        message: "vehicle marked as returned"
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
});






app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
