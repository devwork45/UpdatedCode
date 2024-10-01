const Joi = require('joi');

module.exports.employeeSchema = Joi.object({
    
        employeeId: Joi.string().required(),
        name: Joi.string().required(),
        department: Joi.string().required(),
        position: Joi.string().required(),
        dateOfJoining: Joi.date().required(),
        totalAttendance: Joi.number().default(0).min(0),
        lastAttendanceTime: Joi.date().default(Date.now),
        profilePhoto: Joi.object({
            url: Joi.string().uri().allow("", null),
            filename: Joi.string().allow("", null)
        }),
        contactInformation: Joi.object({
            email: Joi.string().email().required(),
            phone: Joi.string().required()
        }).required(),
        address: Joi.object({
            street: Joi.string().allow("", null),
            city: Joi.string().allow("", null),
            state: Joi.string().allow("", null),
            postalCode: Joi.string().allow("", null),
            country: Joi.string().allow("", null)
        }).allow(null),
        salary: Joi.number().required().min(0)

}).required();
