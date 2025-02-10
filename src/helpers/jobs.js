import Manual from "../models/Manual.js"
import mongoose from "mongoose";
const MONGO_URI = "mongodb+srv://gbemisola:Q7fDlYlYp5VfuPfF@cluster0.gezvnhm.mongodb.net/"
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

  export const sendEmailForExpiry = async () => {
    try {
      const manual = await Manual.find();

  
      console.log(manual);
      return true;
    } catch (err) {
      console.error("Error finding manual:", err);
      return false;
    } finally {
      mongoose.connection.close();
    }
  };


const monthsFromToday = (numberOfMonths) => {
    const resultDate = new Date(new Date());
    resultDate.setMonth(resultDate.getMonth() + numberOfMonths);
    return resultDate;
}

sendEmailForExpiry()