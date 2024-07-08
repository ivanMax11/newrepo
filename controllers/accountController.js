const accountModel = require('../models/account-model');
const utilities = require('../utilities');
const pool = require('../database');
const bcrypt = require('bcrypt');

const accountController = {};

/* ****************************************
*  Deliver login view
* *************************************** */
accountController.buildLogin = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/login", {
        title: "Login",
        nav,
    });
}

/* ****************************************
*  Handle login
* *************************************** */
accountController.loginUser = async function (req, res, next) {
    const { email, password } = req.body;
    try {
        const userResult = await pool.query('SELECT * FROM account WHERE account_email = $1', [email]);
        if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            const validPassword = await bcrypt.compare(password, user.password);
            if (validPassword) {
                req.session.userId = user.id;
                return res.redirect('/');
            }
        }
        req.flash('error', 'Invalid email or password');
        return res.redirect('/account/login');
    } catch (err) {
        console.error(err);
        next(err);
    }
}

/* ****************************************
*  Deliver registration view
* *************************************** */
accountController.buildRegister = async function (req, res, next) {
    let nav = await utilities.getNav();
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,  // Añadir esta línea
    });
}

/* ****************************************
*  Handle registration
* *************************************** */
accountController.registerUser = async function (req, res, next) {
    const { firstName, lastName, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO account (account_firstname, account_lastname, account_email, account_password) VALUES ($1, $2, $3, $4)', [firstName, lastName, email, hashedPassword]);
        req.flash('success', 'Registration successful! You can now log in.');
        return res.redirect('/account/login');
    } catch (err) {
        console.error(err);
        next(err);
    }
}

/* ****************************************
*  Process Registration
* *************************************** */
accountController.registerAccount = async function (req, res) {
    let nav = await utilities.getNav();
    const { account_firstname, account_lastname, account_email, account_password } = req.body;

    try {
        const regResult = await accountModel.registerAccount(
            account_firstname,
            account_lastname,
            account_email,
            account_password
        );

        if (regResult) {
            req.flash(
                "notice",
                `Congratulations, you're registered ${account_firstname}. Please log in.`
            );
            return res.redirect("/account/login");
        } else {
            req.flash("error", "Sorry, the registration failed.");
            return res.status(501).render("account/register", {
                title: "Registration",
                nav,
                errors: null,  // Añadir esta línea también
            });
        }
    } catch (error) {
        console.error("Error registering account:", error);
        req.flash("error", "An error occurred during registration.");
        return res.status(500).redirect("/"); // Redirige a una página de error genérica
    }
}

module.exports = accountController;
