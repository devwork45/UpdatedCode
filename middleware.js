const Employee = require("./models/Employee");

module.exports.IsLoggedIn=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","you must be logged in to Perform Operation");
        return res.redirect("/login");
      }
      next();

}

module.exports.savedRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;

    }
    next();
    
}

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params; // Extracting `id` from route parameters
    let employee = await Employee.findById(id); // Fetching the employee by ID

    // Checking if the current user is the owner of the employee
    if (!employee.owner.equals(res.locals.currUser._id)) {
        req.flash("error", "You don't have permission to access this!");
        return res.redirect(`/employees/${id}`);
    }
    next();
};
