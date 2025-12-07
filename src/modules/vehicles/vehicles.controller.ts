import { Request, Response } from "express";
import { vehicleService } from "./vehicles.service";

const createVehicle =async (req: Request, res: Response) => {
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
    const result = await vehicleService.createVehicleDB(vehicle_name,type,registration_number,daily_rent_price,availability_status)
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
}

const getVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getVehicle();
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
}

const getSingleVehicle = async (req: Request, res: Response) => {
  const id = req.params.vehicleId;
  try {
    const result = await vehicleService.getSingleVehicle(id)

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
}

const updateVehicle = async (req: Request, res: Response) => {
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
    const result = await vehicleService.updateVehicle(vehicle_name,type,registration_number,daily_rent_price,availability_status,id)


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
}

const deleteVehicle = async (req: Request, res: Response) => {
  const id = req.params.vehicleId;
  try {

    const result = await vehicleService.deleteVehicle(id)

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
}



export const vehicleControllers = {
    createVehicle,
    getVehicle,
    getSingleVehicle,
    updateVehicle,
    deleteVehicle
}