import jwt from "jsonwebtoken";
import UnauthenticatedError from "../utils/errors/unauthenticated.js";
import asyncWrapper from "./async.js";
import UsersService from '../services/User.service.js'

const authMiddleware = asyncWrapper(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const userService = new UsersService();

  if (!authHeader || !authHeader.startsWith("Bearer ")) {

    throw new UnauthenticatedError("No token provided");

  } else {

    const token = authHeader.split(" ")[1];

    if (token) {
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { id, email, dept } = decoded;
    
      const user = await userService.findEmail(email)

      if(!user) {

        throw new UnauthenticatedError("Not authorized to access this route");
      }

      req.user = {
        id,
        email,
        dept,
        role: user.role,
      };

      return next();
    }
  }

});

export default authMiddleware;
