import 'dotenv/config';
import connectionDb from "./db/index.js"
import {app} from './app.js'

connectionDb()
.then(app.listen(process.env.PORT||8000,()=>{
     console.log(`App is running on port ${process.env.PORT}`);
}))
.catch((err)=>{
    console.log("MongoDB connection failed error : ",err);
})

