require("dotenv").config()
const mongoose = require("mongoose")

async function testConnection() {
  try {
    await mongoose.connect(process.env.MONGO_URI)

    console.log("✅ MongoDB Atlas connected successfully")

    await mongoose.connection.close()
    process.exit()
  } catch (error) {
    console.error("❌ Connection failed")
    console.error(error.message)
    process.exit(1)
  }
}

testConnection()