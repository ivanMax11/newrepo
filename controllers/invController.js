const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const invController = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);

    if (!data || data.length === 0) {
      req.flash("error", "No vehicles found for this classification");
      return res.redirect("/inv/");
    }

    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error in buildByClassificationId:", error);
    next(error);
  }
};

/* ***************************
 *  Build inventory detail view
 * ************************** */
invController.buildByInventoryId = async function (req, res, next) {
  const inventoryId = req.params.inventoryId;
  try {
    const vehicleData = await invModel.getVehicleById(inventoryId);
    const html = utilities.buildVehicleDetailView(vehicleData);
    let nav = await utilities.getNav();
    res.render("./inventory/details", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      vehicleHTML: html,
    });
  } catch (error) {
    console.error("Error fetching vehicle details:", error);
    res.status(500).send('Server Error');
  }
};

/* ***************************
 *  Render add-classification view
 * ************************** */
invController.renderAddClassification = async function (req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add New Classification",
    nav,
    errors: null,
    message: null
  });
};

/* ***************************
 *  Process the form for adding a new classification
 * ************************** */
invController.processAddClassification = async function (req, res, next) {
  const errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    return res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      errors: errors.array(),
      message: null
    });
  }

  const { classification_name } = req.body;

  try {
    const result = await invModel.addClassification(classification_name);

    if (result.rowCount > 0) {
      req.flash("success", "New classification added successfully.");
      return res.redirect("/inv/management");
    } else {
      req.flash("error", "Failed to add classification.");
      return res.redirect("/inv/add-classification");
    }
  } catch (error) {
    console.error("Error processing add classification:", error);
    req.flash("error", "Server Error. Please try again.");
    return res.status(500).redirect("/inv/add-classification");
  }
};

invController.renderManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(); 
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
      classificationList, 
      messages: req.flash() 
    });
  } catch (error) {
    console.error("Error rendering management view:", error);
    res.status(500).send('Server Error');
  }
};

/* ***************************
 *  Render add-inventory view
 * ************************** */
invController.renderAddInventory = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationListHTML();
    res.render("./inventory/add-inventory", {
      title: "Add New Inventory Item",
      nav,
      classificationList,
      errors: null
    });
  } catch (error) {
    console.error("Error rendering add inventory view:", error);
    res.status(500).send('Server Error');
  }
};


/* ***************************
 *  Process add-inventory form
 * ************************** */
invController.processAddInventory = async function (req, res, next) {
  const errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg));
    return res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList: await utilities.buildClassificationList(),
      errors: errors.array(),
      messages: req.flash()
    });
  }

  const { inv_make, inv_model, classification_id, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body;

  try {
    await invModel.addInventory(inv_make, inv_model, classification_id, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color);
    req.flash('success', 'Inventory item added successfully');
    return res.redirect('/inv/management');
  } catch (error) {
    console.error("Error adding inventory item:", error);
    req.flash('error', 'Failed to add inventory item');
    return res.redirect('/inv/add-inventory');
  }
};


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invController.getInventoryJSON = async function (req, res, next) {
  const classification_id = req.params.classification_id;
  try {
    const inventoryData = await invModel.getInventoryByClassificationId(classification_id);
    if (inventoryData.length === 0) {
      return res.status(404).json({ message: "No inventory found for this classification ID."});
    }
    res.json(inventoryData);
  }catch (error) {
    console.error("Error fetching inventory data:", error);
    next(error);
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invController.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getVehicleById(inv_id);
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    console.error("Error rendering edit inventory view:", error);
    next(error);
  }
};

/* ***************************
 *  Delete Inventory Item
 * ************************** */
invController.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id, 10);
  try {
    const result = await invModel.deleteInventory(inv_id);
    if (result.rowCount > 0) {
      req.flash('success', 'Inventory item deleted successfully');
    } else {
      req.flash('error', 'Failed to delete inventory item');
    }
    res.redirect('/inv/management');
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    req.flash('error', 'Failed to delete inventory item');
    res.redirect('/inv/management');
  }
};




/* ***************************
 *  Update Inventory Data
 * ************************** */
invController.updateInventory = async function (req, res, next) {
  const errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    req.flash('error', errors.array().map(e => e.msg));
    return res.render("inventory/edit-inventory", {
      title: "Edit Inventory",
      nav,
      classificationList: await utilities.buildClassificationList(),
      errors: errors.array(),
      messages: req.flash()
    });
  }

  const { inv_id, inv_make, inv_model, classification_id, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body;

  const id = parseInt(inv_id, 10);
  const price = parseFloat(inv_price);
  const year = parseInt(inv_year, 10);
  const miles = parseInt(inv_miles, 10);
  const classificationId = parseInt(classification_id, 10);

  if (isNaN(id) || isNaN(price) || isNaN(year) || isNaN(miles) || isNaN(classificationId)) {
    req.flash("notice", "Invalid input for numeric fields.");
    const classificationSelect = await utilities.buildClassificationList(classification_id);
    return res.status(400).render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationSelect,
      errors: [{ msg: "Invalid input for numeric fields." }],
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id
    });
  }

  try {
    const updateResult = await invModel.updateInventory(
      id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      price,
      year,
      miles,
      inv_color,
      classificationId
    );
    
    console.log("Update result:", updateResult); 
    
    req.flash('success', 'Inventory item modified successfully');
    return res.redirect('/inv/management'); 
  } catch (error) {
    console.error("Error updating inventory item:", error);
    req.flash('error', 'Failed to modify inventory item');
    return res.redirect('/inv/management');
  }
};





module.exports = invController;