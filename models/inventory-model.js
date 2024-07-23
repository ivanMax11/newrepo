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

/* ***************************
 *  Get all inventory items
 * ************************** */
async function getAllInventory() {
  try {
    const data = await pool.query('SELECT inv_id, inv_make, inv_model FROM public.inventory');
    return data.rows;
  } catch (error) {
    console.error("Error fetching all inventory items:", error);
    throw error;
  }
}


/* ***************************
 *  Mark Inventory Item as Sold
 * ************************** */
async function markAsSold(inv_id) {
  try {
    const sql = "UPDATE public.inventory SET inv_sold = true WHERE inv_id = $1 RETURNING *";
    const result = await pool.query(sql, [inv_id]);
    return result.rows[0];
  } catch (error) {
    console.error("Error marking item as sold:", error);
    throw error;
  }
}


/* ***************************
 *  Get Sold Inventory Items
 * ************************** */
async function getSoldItems() {
  try {
    const query = 'SELECT * FROM public.inventory WHERE inv_sold = TRUE ORDER BY inv_id ASC';
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error("Error fetching sold items:", error);
    throw error;
  }
}



async function deleteInventory(inv_id) {
  const query = 'DELETE FROM inventory WHERE inv_id = $1';
  const result = await pool.query(query, [inv_id]);
  return result;
}



/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
    throw error; 
  }
}




module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
  getAllInventory,
  updateInventory,
  deleteInventory,
  markAsSold,
  getSoldItems
 
 
};
