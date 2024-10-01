const employees = [
    {
        employeeId: "321654",
        name: "Neeraj",
        position: "Robotics",
        email: "C",
        starting_year: 2017,
        total_attendance: 7,
        last_attendance_time: new Date("2022-12-11T00:54:34Z"), // Make sure the date is in proper format
        dept: 4,
    },
    {
        employeeId: "852741",
        name: "Emly Blunt",
        position: "Economics",
        email: "B",
        starting_year: 2021,
        total_attendance: 12,
        last_attendance_time: new Date("2022-12-11T00:54:34Z"),
        dept: 1,
    },
    {
        employeeId: "963852",
        name: "Elon Musk",
        position: "Physics",
        email: "B",
        starting_year: 2020,
        total_attendance: 7,
        last_attendance_time: new Date("2022-12-11T00:54:34Z"),
        dept: 2,
    }
];

module.exports = { data: employees };
