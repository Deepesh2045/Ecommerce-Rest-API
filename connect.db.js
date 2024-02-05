import mongoose from "mongoose";

const dbName = "ecommerce";
const connectDb = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://dcoder2024:coder123@cluster0.71vcmho.mongodb.net/${dbName}?retryWrites=true&w=majority`
    );
    console.log("Database connected successfully");
  } catch (error) {
    console.log("Database connection failed");
    console.log(error.message);
  }
};
export default connectDb;
