const pool = require('../database');

/* *****************************
* Register new account
* ***************************** */
async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_password]);
    return result;
  } catch (error) {
    return error.message;
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

/* **********************
 *   Check for existing email
 * ********************* */
async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* To get the account information for account_id
* ***************************** */
async function getAccountById(accountId) {
  try {
    const result = await pool.query(
      'SELECT account_firstname, account_lastname, account_email FROM account WHERE account_id = $1',
      [accountId]
    );
    return result.rows[0];
  } catch (err) {
    console.error("Error fetching account by ID:", err);
    throw err;
  }
}

/* *****************************
* To update the account info
* ***************************** */
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  try {
    await pool.query(
      'UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4',
      [account_firstname, account_lastname, account_email, account_id]
    );
  } catch (err) {
    console.error("Error updating account:", err);
    throw err;
  }
}

/* *****************************
* Update the password
* ***************************** */
async function updateAccountPassword(account_id, hashedPassword) {
  try {
    await pool.query(
      'UPDATE account SET account_password = $1 WHERE account_id = $2',
      [hashedPassword, account_id]
    );
  } catch (err) {
    console.error("Error updating account password:", err);
    throw err;
  }
}


module.exports = {
  registerAccount,
  getAccountByEmail,
  checkExistingEmail,
  getAccountById,
  updateAccount,
  updateAccountPassword
};
