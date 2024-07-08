import mongoose from "mongoose";


const dbConn= async() => {
    
    try {
       await  mongoose.connect(process.env.DB_URL)

        console.log("Database Connected Successfully")
    }
    catch (error) {
        console.log(error)
    }
}


export default dbConn