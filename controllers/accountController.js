const accountModel = require("../models/account-model");
const utilities = require("../utilities");
const pool = require("../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validationResult } = require("express-validator");

async function buildLogin(req, res) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: [],
    messages: req.flash()
  });
}

async function buildRegister(req, res) {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: [],
    messages: req.flash(),
    account_firstname: "",
    account_lastname: "",
    account_email: ""
  });
}

async function registerUser(req, res, next) {
  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  const errors = validationResult(req);

  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render('account/register', {
      title: 'Register',
      nav,
      errors: errors.array(),
      messages: req.flash(),
      account_firstname,
      account_lastname,
      account_email,
      account_password
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    await pool.query(
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password) VALUES ($1, $2, $3, $4)",
      [account_firstname, account_lastname, account_email, hashedPassword]
    );
    req.flash("success", "Registration successful! You can now log in."); // Flash success message
    return res.redirect("/account/login"); // Redirect to login page
  } catch (err) {
    console.error("Error registering user:", err);
    req.flash("error", "Registration failed. Please try again.");
    next(err);
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res, next) {
  const { account_email, account_password } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    req.flash("error", "Invalid email or password. Please try again."); // Configura el mensaje flash
    return res.redirect("/account/login"); // Redirige de vuelta a la página de inicio de sesión
  }

  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData || !(await bcrypt.compare(account_password, accountData.account_password))) {
    req.flash("error", "Invalid email or password. Please try again."); // Configura el mensaje flash
    return res.redirect("/account/login"); // Redirige de vuelta a la página de inicio de sesión
  }

  // Si el inicio de sesión es exitoso, configura cualquier otra información de sesión necesaria
  try {
    delete accountData.account_password;
    const accessToken = jwt.sign(
      accountData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 }
    );
    if (process.env.NODE_ENV === "development") {
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    } else {
      res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: true,
        maxAge: 3600 * 1000,
      });
    }
    req.flash("success", "Login successful!"); // Configura el mensaje flash de éxito si es necesario
    return res.redirect("/account/"); // Redirige a la vista de gestión de cuenta
  } catch (error) {
    console.error("Error during login:", error);
    next(new Error("Access Forbidden"));
  }
}



const buildAccountManagement = async (req, res) => {
  try {
    let nav = await utilities.getNav();
    res.render("account/accountManagement", {
      title: "Account Management",
      message: "You're logged in",
      nav
    });
  } catch (error) {
    console.error("Error delivering account management view:", error);
    res.status(500).send("Internal Server Error");
  }
};

// Exportar las funciones
module.exports = {
  accountLogin,
  registerUser,
  buildLogin,
  buildRegister,
  buildAccountManagement,
};
