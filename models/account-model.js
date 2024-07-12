// models/account-model.js

// Requerir el archivo de la base de datos
const pool = require('../database/index');

// Registrar nueva cuenta
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return result;
  } catch (error) {
    return error.message;
  }
}

module.exports = { registerAccount };