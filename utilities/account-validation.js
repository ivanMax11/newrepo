const utilities = require(".");
const { body, validationResult } = require("express-validator");
const accountModel = require("../models/account-model");
const validate = {};

// Registration Data Validation Rules
validate.registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a first name."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 2 })
      .withMessage("Please provide a last name."),

    body("account_email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use different email");
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements.")
      .custom(value => {
        console.log("Validating password:", value);
        return true;
      })
  ];
};

// Check data and return errors or continue to registration
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email, account_password } = req.body;
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    let nav = await utilities.getNav();
    res.render("account/register", {
      errors: errors.array(),
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    });
    return;
  }
  next();
};

// Login Data Validation Rules
validate.loginRules = () => {
  return [
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .withMessage("Please provide a valid email address."),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Please provide your password."),
  ];
};

// Check data and return errors or continue to login
validate.checkLoginData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    let nav = await utilities.getNav();
    res.render("account/login", {
      errors: errors.array(),
      title: "Login",
      nav,
    });
    return;
  }
  next();
};

module.exports = validate;
