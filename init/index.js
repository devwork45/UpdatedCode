const mongoose = require("mongoose");
const initData = require("./data.js");
const Employee = require("../models/Employee.js");

async function main() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/Employee', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connection Successful");
    } catch (err) {
        console.error("Connection Error:", err);
    }
}

const initDB = async () => {
    try {
        await Employee.deleteMany({}); // Clear existing data
        await Employee.insertMany(initData.data); // Insert new data
        console.log("Data was initialized successfully");
    } catch (error) {
        console.error("Error initializing data:", error);
    } finally {
        mongoose.connection.close(); // Close the connection after initialization
    }
};

main().then(initDB);
