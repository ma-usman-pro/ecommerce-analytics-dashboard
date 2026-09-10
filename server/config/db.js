const mongoose = require("mongoose");

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 * Never hardcode the connection string — it must come from the environment.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      "[db] MONGO_URI is not set. Add it to your .env file (see .env.example)."
    );
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(uri);
    console.log(
      `[db] MongoDB connected -> host: ${conn.connection.host}, db: ${conn.connection.name}`
    );

    mongoose.connection.on("error", (err) => {
      // Log without leaking the connection string itself
      console.error("[db] MongoDB runtime error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("[db] MongoDB disconnected.");
    });

    return conn;
  } catch (err) {
    console.error("[db] MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
