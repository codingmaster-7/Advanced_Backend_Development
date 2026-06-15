import 'dotenv/config';
import jwt from "jsonwebtoken";
import { asyncHandler } from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/user.model.js';

const jwtVerify=asyncHandler(async (req,res,next)=>{
      try{
        const token=req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
      if(!token){
         throw new ApiError(401,"Unauthorized Request");
      }
      const decoded=jwt.verify(token,process.env.ACCESS_KEY_SECRET);
      const user=await User.findById(decoded?._id).select("-password -refreshToken");
      if(!user){
          throw new ApiError(400,"Invalid Access Token ");
      }
      req.user=user;
      next();
      }
      catch(err){
         throw new ApiError(401,err?.message || "Invalid Access Token");
      }
})

export default jwtVerify;