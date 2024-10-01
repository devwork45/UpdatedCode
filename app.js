const express = require('express');
const path = require('path');
const app = express();

const mongoose=require("mongoose");
const ejsMate = require('ejs-mate');
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");

const Employee = require('./models/Employee'); // Imports the Employee model (adjust path if necessary)

const session=require("express-session");
const flash=require("connect-flash");
const User=require("./models/user.js");


const PDFDocument = require('pdfkit'); // Make sure to install pdfkit

const {employeeSchema}=require("./schema.js");

const passport=require("passport");
const LocalStrategy=require("passport-local");
const {IsLoggedIn, savedRedirectUrl,isOwner}=require("./middleware.js");

const methodOverride=require("method-override");
// Serve static files

app.use(express.static(path.join(__dirname, 'public')));


app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.json());

// Set up ejs-mate as the rendering engine
app.engine('ejs', ejsMate);



const MONGO_URL="mongodb://127.0.0.1:27017/Employee";

main()
  .then(()=>{
    console.log("Connected to DB");
  })
  .catch((err)=>{
    console.log(err);
  });

  async function main(){
    await mongoose.connect(MONGO_URL);  }

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



const validateEmployee = (req, res, next) => {
  let { error } = employeeSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};


const sessionOptions={
  secret:"mysupersecretcode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now() + 7 *24*60*60*1000,
    maxAge: 7 *24*60*60*1000,
    httpOnly:true,
  }
}

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  
  next();
});



app.get("/signup",(req,res)=>{
  res.render("users/signup.ejs");
});

app.post("/signup",async(req,res)=>{
 
  
  try{
    let {username,email,password}=req.body;
    const newUser=new User({email,username});
    const registeredUser=await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser,(err)=>{
      if(err){
        return next(err);
      }
      req.flash("success","Welcome to The IT Solutions");
      res.redirect("/employees");
    })
    
  }catch(err){
    req.flash("error",err.message);
    res.redirect("/signup");
  }
  
});

app.get("/login",(req,res)=>{
  res.render("users/login.ejs");
});

app.post("/login",savedRedirectUrl,passport.authenticate("local",{failureRedirect:"/login",failureFlash:true}),async(req,res)=>{
     req.flash("success","Welcome to The IT Solutions");
     let redirectUrl=res.locals.redirectUrl ||"/employees";

     res.redirect(redirectUrl);
});


app.get("/logout",(req,res,next)=>{
  req.logout((err)=>{
    if(err){
      return next(err);
    }
    req.flash("success","You are Logged Out");
    res.redirect("/login");
  })
});

app.get("/home",(req,res)=>{
  res.render("listings/home.ejs");
});

app.get("/privacy",(req,res)=>{
  res.render("listings/privacy.ejs");
});

app.get("/terms",(req,res)=>{
  res.render("listings/terms.ejs");
});


app.get('/employees', IsLoggedIn,async (req, res) => { // Defines a GET route at '/employees' that handles asynchronous requests
    
    const employees = await Employee.find({}); // Fetches all employee documents from the database
    res.render('listings/index', { employees }); // Renders the 'index' view template and passes the employees data to it
    
});

app.get("/employees/new",IsLoggedIn,(req,res)=>{
 
  res.render("listings/new.ejs");
});

app.get("/employees/:id",wrapAsync(async(req,res)=>{
    let {id}=req.params;
    const employee=await Employee.findById(id);
    if(!employee){
      req.flash("error","Employee you are requesting doesn't exist!!");
      res.redirect("/employees");
    }
    res.render("listings/show.ejs",{employee});
}));



app.get('/employees/:id/generate-report', IsLoggedIn, wrapAsync(async (req, res) => {
  const { id } = req.params;
  console.log(`Fetching employee with ID: ${id}`); // Debugging log

  // Find the employee by ID
  const employee = await Employee.findById(id);
  if (!employee) {
      console.log('Employee not found'); // Debugging log
      return res.status(404).send('Employee not found');
  }
  console.log(`Employee found: ${employee.name}`); // Debugging log

  // Create a PDF document
  const doc = new PDFDocument();
  res.setHeader('Content-disposition', 'attachment; filename=employee-report.pdf');
  res.setHeader('Content-type', 'application/pdf');
  doc.pipe(res);

  // Add content to the PDF
  doc.fontSize(25).text('Employee Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(20).text(`Name: ${employee.name}`);
  doc.text(`Employee ID: ${employee.employeeId}`);
  doc.text(`Position: ${employee.position}`);
  doc.text(`Department: ${employee.department}`);
  doc.text(`Date of Joining: ${employee.dateOfJoining.toDateString()}`);
  doc.text(`Total Attendance: ${employee.totalAttendance}`);
  doc.text(`Last Attendance Time: ${employee.lastAttendanceTime.toLocaleString()}`);
  doc.text(`Email: ${employee.contactInformation.email}`);
  doc.text(`Phone: ${employee.contactInformation.phone}`);
  doc.text(`Address: ${employee.address.street}, ${employee.address.city}, ${employee.address.state} ${employee.address.postalCode}, ${employee.address.country}`);
  
  // Add salary information if the user has permission
  if (req.user && req.user._id === "66d0650103147610971bb8f0") {
      doc.text(`Salary: ₹${employee.salary.toLocaleString()}`);
  }

  console.log('Finalizing the PDF document'); // Debugging log
  doc.end();
}));







app.post('/employees', IsLoggedIn,validateEmployee,wrapAsync(async (req, res, next) => {
  
      const newEmployee = new Employee(req.body);
      newEmployee.owner=req.user._id;
      await newEmployee.save();
      req.flash("success","New Employee Has been Added!!");
      res.redirect('/employees');
  
}));



app.get("/employees/:id/edit",IsLoggedIn,isOwner, async (req,res)=>{
  let {id}=req.params;
  const employee=await Employee.findById(id);
  if(!employee){
    req.flash("error","Employee you are requesting doesn't exist!!");
    res.redirect("/employees");
  }
  res.render("listings/edit.ejs",{employee});

});

// app.put("employees/:id",async(req,res)=>{
//   let {id}=req.params;
//   await Employee.findByIdAndUpdate(id,{...req.body.employee});
//   redirect("/employees");
// });

// app.put("/employees/:id", validateEmployee, wrapAsync(async (req, res) => {
  
    
//       let { id } = req.params;
//       // Use req.body directly, as fields should be directly under req.body
//       await Employee.findByIdAndUpdate(id, req.body, { new: true }); // `{ new: true }` returns the updated document
//       res.redirect("/employees");
  
// }));

app.put("/employees/:id", IsLoggedIn,wrapAsync(async (req, res) => {
  let { id } = req.params;
  await Employee.findByIdAndUpdate(id, req.body, { new: true });
  req.flash("success","Employee has been Updated Successfully!!");
  res.redirect("/employees");
}));




app.delete("/employees/:id", IsLoggedIn,isOwner, async(req,res)=>{
    let {id}=req.params;
    let deletedEmployee=await Employee.findByIdAndDelete(id);
    console.log(deletedEmployee);
    req.flash("success","Employee has been Deleted Successfully!!");
    res.redirect("/employees");
});

app.all("*",(req,res,next)=>{
      next(new ExpressError(404,"Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  res.status(statusCode).render("error.ejs", { message });
  console.log(err);
});



// Error ha9ndling and other middlewares
// Add middleware for flash messages if you're using connect-flash and express-session
// e.g., app.use(require('express-session')({ secret: 'your-secret', resave: false, saveUninitialized: false }));
// e.g., app.use(require('connect-flash')());

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
