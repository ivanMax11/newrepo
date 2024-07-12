const regValidate = require('../utilities/account-validation')
const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const utilities = require('../utilities');
const { registerAccount } = require('../models/account-model');

router.get('/login', accountController.buildLogin);
router.post('/login', accountController.loginUser);

router.get('/register', accountController.buildRegister);
router.post('/register', accountController.registerUser);
// Process the registration data
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

module.exports = router;