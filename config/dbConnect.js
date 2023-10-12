import mongoose from "mongoose";

const dbConnect = async () => {
  try {
    const connected = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${connected.connection.host}`);
  } catch (error) {
    console.log(`Error from dbConnect file: ${error.message}`);
  }
};

export default dbConnect;
