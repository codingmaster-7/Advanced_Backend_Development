import {asyncHandler} from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
const generateAccessTokenAndRefreshToken= async (user)=>{
           try{
               const accessToken= await user.generateAccessToken();
               const refreshToken=await user.generateRefreshToken();
               user.refreshToken=refreshToken;
               await user.save({validateBeforeSave:false});
               return {accessToken,refreshToken};
           }
           catch(err){
                throw new ApiError(500,"Error occur while generating access token and refresh token");
           }
    }
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
const loginUser= asyncHandler(async (req , res)=>{
   const {email,password,userName}=req.body;
    if(!userName && !email){
      throw new ApiError(400,"Enter userName or email");
    }
    const user=await User.findOne({$or:[{userName},{email}]});
    if(!user){
      throw new ApiError(400,"User does not exit");
    }
    const validated=await user.isPasswordCorrect(password);

    if(!validated){
      throw new ApiError(401,"Invalid user credentials");
    }
    

    const {accessToken,refreshToken}= await generateAccessTokenAndRefreshToken(user);
    const loggedInUser= await User.findById(user._id).select("-password -refreshToken")
    const options={
      httpOnly:true,
      secure:true,
    }
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
       new ApiResponse(200,{
          user:loggedInUser,accessToken,refreshToken
       },"Logged In Successfully !!")
    )


})
const logoutUser= asyncHandler(async (req , res)=>{
    const user=await User.findByIdAndUpdate(req.user._id,{$unset:{refreshToken:1}},{new:true});
    const options={
      httpOnly:true,
      secure:true,
    }
    res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
       new ApiResponse(200,{},"Logged Out Successfully!!")
    )
})
const refreshAccessToken=asyncHandler(async (req,res)=>{
       const refreshToken=req.cookies?.refreshToken;
       const decoded=jwt.verify(refreshToken,process.env.REFRESH_KEY_SECRET);
       const user=await User.findById(decoded._id);
       if(!user){
        throw new ApiError(400,"Unauthorized Request");
       }
       if(refreshToken!==user.refreshToken){
        throw new ApiError(400,"Refresh Token Expired");
       }
       const {accessToken,refreshToken :newRefreshToken}=await generateAccessTokenAndRefreshToken(user);

       const options={
        httpOnly:true,
        secure:true,
       }
       res.status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",newRefreshToken,options)
       .json(
         new ApiResponse(201,{},"Session restarted!!")
       )
})
const changePassword=asyncHandler(async (req,res)=>{
      
      const {newPassword}=req.body;
      console.log(newPassword);
      if(!newPassword){
        throw new ApiError(400,"New password is required");
      }
      req.user.password=newPassword;
      await req.user.save({validateBeforeSave:false});
      res.status(200)
      .json(
        new ApiResponse(200,{},"Password Changed Successfully!!")
      )

})
const updateUser=asyncHandler(async (req,res)=>{
     const {fullName,email}=req.body;
     if(!fullName || !email){
       throw new ApiError(400,"Some fields are missing ");
     }
     req.user.fullName=fullName;
     req.user.email=email;
     await req.user.save({validateBeforeSave:false});
     res.status(200)
     .json(
      new ApiResponse(200,req.user,"User Profile is updateded successfully!!")
     )
})
const changeAvatar=asyncHandler(async (req , res)=>{
      const avatar=req.file.path;
      if(!avatar){
        throw new ApiError(500,"file is not found in local folder");
      }
      console.log(avatar);
      const avatarString=await uploadOnCloudinary(avatar); 
      if(avatarString!==undefined){
         req.user.avatar=avatarString.url;
         await req.user.save({validateBeforeSave:false});
      }
      else{
        throw new ApiError(500,"Unable to upload on cloudinary");
      }
      res.status(200)
      .json(
        new ApiResponse(200,"Avatar changed successfully!!")
      )
})
export {registerUser , loginUser , logoutUser , refreshAccessToken,changePassword,updateUser,changeAvatar}