const regValidate = require('../utilities/account-validation');
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const utilities = require('../utilities');

// Route to show the login view
router.get('/login', accountController.buildLogin);

// Process the login request
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
);

// Route to show the register view
router.get('/register', accountController.buildRegister);

// Procesar la solicitud de registro
router.post(
    '/register',
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerUser) 
);

// Route to show the accountManagement view
router.get(
    '/', 
    utilities.checkLogin, utilities.handleErrors(accountController.buildAccountManagement) 
);

// Route to show the account update view
router.get('/edit/:id', utilities.checkLogin, accountController.buildAccountUpdate);

// Route to handle account update
router.post('/update/:id', utilities.checkLogin, accountController.updateAccount);

// Route to handle password update
router.post('/update-password/:id', utilities.checkLogin, accountController.updatePassword);

// Route to handle logout
router.get('/logout', accountController.logout);

module.exports = router;
