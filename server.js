// Requiere statements
const baseController = require("./controllers/baseController");
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const staticRoutes = require("./routes/static");
const inventoryRoute = require("./routes/inventoryRoute");
const utilities = require('./utilities/');
const session = require("express-session");
const flash = require('connect-flash');
const pool = require('./database');
const accountRouter = require('./routes/accountRoute');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


// View Engine and Templates
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

// Middleware
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: false, 
  cookie: { secure: false } 
}));

app.use(flash());


// Middleware to establish the locals data
app.use((req, res, next) => {
  res.locals.loggedin = req.session.loggedin || false;
  res.locals.messages = req.flash();
  next();
});


// JWT Token Middleware
app.use(utilities.checkJWTToken);

// Routes
app.use("/static", staticRoutes);
app.get("/", utilities.handleErrors(baseController.buildHome));
app.use("/inv", inventoryRoute);
app.use("/account", accountRouter);

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' });
});

// Express Error Handler
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  let message;
  if (err.status == 404) {
    message = err.message;
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?';
  }
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  });
});

// Local Server Information
const port = process.env.PORT || 3000;
const host = process.env.HOST || "localhost";

// Log statement to confirm server operation
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
