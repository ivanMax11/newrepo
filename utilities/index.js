const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  try {
    // To get the classification from  model
    let data = await invModel.getClassifications();
    
    // Inicialize the navigation list
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';

   
    // Verify if there are date valide to construct the navigation list
    if (data && data.length > 0) {  
      data.forEach((row) => {
        list += "<li>";
        list +=
          `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">` +
          `${row.classification_name}</a>`;
        list += "</li>";
      });
    } else {
      // Handle in case aren´t classifications don´t findit
      list += '<li><a href="#" title="No classifications found">No Classifications Found</a></li>';
    }

    list += "</ul>";
    return list;
  } catch (error) {
    // Handle errors to get the classifications
    console.error("Error in getNav:", error);
    return '<ul><li><a href="#" title="Error loading classifications">Error Loading Classifications</a></li></ul>';
  }
};

/* **************************************
 * Build the classification view HTML
 ************************************** */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        `<a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">` +
        `<img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors" /></a>`;
      grid += '<div class="namePrice">';
      grid += "<hr />";
      grid +=
        `<h2><a href="../../inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">` +
        `${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`;
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the vehicle detail view HTML
 ************************************** */
Util.buildVehicleDetailView = function (vehicle) {
  let detail = '<div class="vehicle-detail">';
  detail += `<h1>${vehicle.inv_make} ${vehicle.inv_model}</h1>`;
  detail += `<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">`;
  detail += `<p>Price: $${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>`;
  detail += `<p>Mileage: ${new Intl.NumberFormat("en-US").format(vehicle.inv_miles)} miles</p>`;
  detail += `<p>Year: ${vehicle.inv_year}</p>`;
  detail += `<p>${vehicle.inv_description}</p>`;
  detail += "</div>";
  return detail;
};

/* **************************************
 * Build the classification list HTML for the add inventory view
 ************************************** */
Util.buildClassificationList = async function () {
  try {
    let data = await invModel.getClassifications();
    return data; 
  } catch (error) {
    console.error("Error building classification list:", error);
    throw error;
  }
};

/* **************************************
 * Build the classification list HTML for the add inventory view
 ************************************** */
Util.buildClassificationListHTML = async function () {
  try {
    let data = await invModel.getClassifications();
    let options = "";
    if (data && data.length > 0) {
      data.forEach((row) => {
        options += `<option value="${row.classification_id}">${row.classification_name}</option>`;
      });
    }
    return options; 
  } catch (error) {
    console.error("Error building classification list:", error);
    throw error;
  }
};


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("notice", "Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      req.flash("notice", "Please log in.");
      return res.redirect("/account/login");
    }
    res.locals.accountData = decoded;
    res.locals.loggedin = true;
    next();
  });
};



module.exports = Util;