import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";

const auth = (...roles: ('admin' | 'customer')[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authToken = req.headers.authorization;
      console.log({ authToken});

      if (!authToken) {
        return res.status(500).json({ message: "Invalid user" });
      }

      const token = authToken.split(" ")[1] as string
      const decoded = jwt.verify(token, config.jwtSecret as string) as JwtPayload;
      req.user = decoded ;
      console.log(decoded);

      
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(500).json({
          error: "Unauthorized",
        });
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

export default auth;
