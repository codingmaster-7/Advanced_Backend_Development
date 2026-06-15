import {asyncHandler} from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
const registerUser= asyncHandler( async (req , res)=>{
      const {userName,email,fullName,avatar,coverImage,password}=req.body;
      console.log(userName,email,fullName,avatar,coverImage,password);
      if([userName,email,fullName,password].some(x=>(x===undefined))){
         throw new ApiError(400,"Some fields are missing");
      }
      const existed= await User.findOne({$or:[{userName},{email}]});
      if(existed){
         throw new ApiError(409,"User with same userName or email exist");
      }

      const Avatar=req.files.avatar
      const CoverImage=req.files.coverImage
      let avatarResponse="";
      let coverImageResponse="";
      if(Avatar!==undefined){
         avatarResponse= await uploadOnCloudinary(Avatar[0].path);
      }
      if(CoverImage!==undefined){
        coverImageResponse=await uploadOnCloudinary(CoverImage[0].path);
      }
      if(avatarResponse===""){
        throw new ApiError(409,"avatar is required");
      }
      console.log(avatarResponse.url);
      const user=await User.create({
         fullName,
         email,
         password,
         userName,
         avatar : avatarResponse.url,
         coverImage : coverImageResponse?.url || "",
      })
      const createdUser=await User.findById(user._id).select(
          "-password -refreshToken"
      )
      if(!createdUser){
        throw new ApiError(500,"Something went wrong at server");
      }
      return res.status(201).json(
          new ApiResponse(200,createdUser,"User created successfully!!")
      )
      
})

export {registerUser}