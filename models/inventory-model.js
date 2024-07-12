const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    const data = await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
    return data.rows;
  } catch (error) {
    console.error("Error fetching classifications:", error);
    throw error;
  }
}

/* **********************************************************************
 *  Get all inventory items and classification_name by classification_id
 * ********************************************************************* */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("Error fetching inventory by classification ID:", error);
    throw error;
  }
}

/* ***************************
 *  Get a vehicle by its ID
 * ************************** */
async function getVehicleById(inventoryId) {
  try {
    const sql = 'SELECT * FROM public.inventory WHERE inv_id = $1';
    const result = await pool.query(sql, [inventoryId]);
    return result.rows[0];
  } catch (error) {
    console.error("Error fetching vehicle by ID:", error);
    throw error;
  }
}

/* ***************************
 *  Add a new classification
 * ************************** */
async function addClassification(classification_name) {
  try {
    const sql = 'INSERT INTO public.classification (classification_name) VALUES ($1)';
    await pool.query(sql, [classification_name]);
  } catch (error) {
    console.error("Error adding classification:", error);
    throw error;
  }
}

/* ***************************
 *  Add a new inventory item
 * ************************** */
async function addInventory(inv_make, inv_model, classification_id, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) {
  try {
    const sql = `
      INSERT INTO public.inventory (inv_make, inv_model, classification_id, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;
    await pool.query(sql, [inv_make, inv_model, classification_id, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color]);
  } catch (error) {
    console.error("Error adding inventory item:", error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory
};
