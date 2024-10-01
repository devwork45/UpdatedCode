const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the Employee schema
const EmployeeSchema = new Schema({
    employeeId: {
        type: String,
        required: true,
        unique: true // Ensure unique employee IDs
    },
    name: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Ensure unique email addresses
    },
    starting_year: {
        type: Number,
        required: true // Year of joining
    },
    total_attendance: {
        type: Number,
        default: 0 // Default to 0 if not provided
    },
    last_attendance_time: {
        type: Date,
        default: Date.now // Default to current date if not provided
    },
    dept: {
        type: Number,
        required: true // Department number
    }
});

// Create the Employee model
const Employee = mongoose.model('Employee', EmployeeSchema);

// Export the model
module.exports = Employee;
