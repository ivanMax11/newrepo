/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const baseController = require("./controllers/baseController")
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const app = express();
const staticRoutes = require("./routes/static"); // Correct import

/* ********************************
 * View Engine and Templates
 **********************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout"); // not at views root

/* ***********************
 * Middleware
 *************************/
app.use(express.static("public")); // Servir archivos estáticos desde la carpeta "public"

/* ***********************
 * Routes
 *************************/
app.use("/static", staticRoutes); // Usar el módulo de rutas estáticas correctamente

// Index route
app.get("/", baseController.buildHome) 

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000; // Default port if .env is not set
const host = process.env.HOST || "localhost"; // Default host if .env is not set

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`);
});
