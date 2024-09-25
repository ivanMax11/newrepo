const accountModel = require("../models/account-model");
const utilities = require("../utilities");
const pool = require("../database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { validationResult } = require("express-validator");


/* ****************************************
 *  Build account to login view
 * ************************************ */
async function buildLogin(req, res) {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
    errors: [],
    messages: req.flash()
  });
}


/* ****************************************
 *  Biuld account to register view
 * ************************************ */
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


/* ****************************************
 *  Process the form to register new account
 * ************************************ */
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
    req.flash("success", "Registration successful! You can now log in.");
    return res.redirect("/account/login");
  } catch (err) {
    console.error("Error registering user:", err);
    req.flash("error", "Registration failed. Please try again.");
    next(err);
  }
}


/* ****************************************
 *  Process the form to login 
 * ************************************ */
async function accountLogin(req, res, next) {
  const { account_email, account_password } = req.body;
  const errors = validationResult(req);

  let nav = await utilities.getNav();

  // Si hay errores en la validación de input (express-validator)
  if (!errors.isEmpty()) {
    return res.render("account/login", {
      title: "Login",
      nav,
      errors: errors.array(),
      messages: req.flash("error", "Please check your email and password."),
    });
  }

  try {
    // Buscar la cuenta por email
    const accountData = await accountModel.getAccountByEmail(account_email);

    // Si no se encuentra el usuario
    if (!accountData) {
      req.flash("error", "Invalid email or password.");
      return res.render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Invalid email or password." }],
        messages: req.flash(),
      });
    }

    // Comparar la contraseña ingresada con la almacenada
    const passwordMatch = await bcrypt.compare(account_password, accountData.account_password);
    
    if (!passwordMatch) {
      req.flash("error", "Invalid email or password.");
      return res.render("account/login", {
        title: "Login",
        nav,
        errors: [{ msg: "Invalid email or password." }],
        messages: req.flash(),
      });
    }

    // Si las credenciales son correctas
    delete accountData.account_password;  // Eliminamos la contraseña antes de generar el token
    const accessToken = jwt.sign(
      accountData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 3600 }  // Token válido por 1 hora
    );

    // Guardar el token en las cookies
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    req.flash("success", "Login successful!");

    // Marcar el inicio de sesión
    res.locals.loggedin = true;
    res.locals.accountData = accountData;

    return res.redirect("/account/");
  } catch (error) {
    console.error("Error during login:", error);
    req.flash("error", "There was an issue logging in. Please try again.");
    return res.redirect("/account/login");
  }
}



/* ****************************************
 *  Build account to render account manageent view
 * ************************************ */
async function buildAccountManagement(req, res) {
  try {
    let nav = await utilities.getNav();
    const { account_firstname, account_id, account_type } = res.locals.accountData;

    // Show the type account to the console to debug
    console.log("Account Type:", account_type); 

    res.render("account/accountManagement", {
      title: "Account Management",
      nav,
      accountFirstName: account_firstname,
      accountId: account_id,
      accountType: account_type, 
      messages: req.flash()
    });
  } catch (error) {
    console.error("Error delivering account management view:", error);
    res.status(500).send("Internal Server Error");
  }
}


/* ****************************************
 *  Build account to render update acount
 * ************************************ */
async function buildAccountUpdate(req, res) {
  const accountId = req.params.id;
  try {
    const accountData = await accountModel.getAccountById(accountId);
    res.render('account/update', {
      title: 'Update Account Information',
      accountId: accountId,
      accountFirstName: accountData.account_firstname,
      accountLastName: accountData.account_lastname,
      accountEmail: accountData.account_email,
      nav: '<ul><li><a href="/inventory">Inventory Management</a></li></ul>', 
      messages: req.flash('messages')
    });
  } catch (error) {
    console.error("Error delivering update view:", error);
    res.status(500).send("Internal Server Error");
  }
}


/* ****************************************
 *  Process to update the account information
 * ************************************ */
async function updateAccount(req, res) {
  const { account_firstname, account_lastname, account_email, account_id } = req.body;

  if (!account_firstname || !account_lastname || !account_email) {
    req.flash('messages', { error: 'All fields are required.' });
    return res.redirect(`/account/management/${account_id}`);
  }

  try {
    await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

    // To get data update
    const accountData = await accountModel.getAccountById(account_id);
    // Update the account data for res.locals
    res.locals.accountData = { 
      account_id, 
      account_firstname: accountData.account_firstname, 
      account_lastname: accountData.account_lastname, 
      account_email: accountData.account_email, 
      account_type: accountData.account_type // Include the type account
    };

    /* ****************************************
    Regener the JWT token
    ************************************ */
    const accessToken = jwt.sign(
      res.locals.accountData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
    
    req.flash('messages', { success: 'Account information updated successfully.' });
    return res.redirect('/account/');
  } catch (error) {
    req.flash('messages', { error: 'Error updating account information. Please try again.' });
    return res.redirect(`/account/edit/${account_id}`);
  }
}

/* ****************************************
 *  build account to update password view
 * ************************************ */
async function updatePassword(req, res) {
  const { password, account_id } = req.body;

  if (!password) {
    req.flash('messages', { error: 'Password is required.' });
    return res.redirect(`/account/edit/${account_id}`);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await accountModel.updateAccountPassword(account_id, hashedPassword);

    // To get the data update
    const accountData = await accountModel.getAccountById(account_id);

     // Update the account data for res.locals
    res.locals.accountData = { 
      account_id, 
      account_firstname: accountData.account_firstname, 
      account_lastname: accountData.account_lastname, 
      account_email: accountData.account_email, 
      account_type: res.locals.accountData.account_type 
    };

    // Regener the  JWT token
    const accessToken = jwt.sign(
      res.locals.accountData,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });

    req.flash('messages', { success: 'Password updated successfully.' });
    return res.redirect('/account/management');
  } catch (error) {
    req.flash('messages', { error: 'Error updating password. Please try again.' });
    return res.redirect(`/account/edit/${account_id}`);
  }
}


/* ****************************************
 *  build account to logout view
 * ************************************ */
async function logout(req, res) {
  res.clearCookie('jwt'); // Nota: debes usar 'jwt' si es el nombre del cookie para el token
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.redirect('/');
  });
}

module.exports = {
  buildLogin,
  buildRegister,
  registerUser,
  accountLogin,
  buildAccountManagement,
  buildAccountUpdate,
  updateAccount,
  updatePassword,
  logout
};
