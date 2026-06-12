import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');
import 'dotenv/config';
import connectionDb from "./db/index.js"

connectionDb();

// const app=express();
// (async ()=>{
//     try{
//       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//       app.on("Error",(error)=>{
//          console.log("Error",error);
//          throw error;
//       })
//       app.listen(process.env.PORT,()=>{
//           console.log(`App is listenig on port${process.env.PORT}`); 
//       })
//     }
//     catch (error){
//         console.log("Error : ",error)
//         throw error
//     }
// })()