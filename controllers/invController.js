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

/* ***************************
 *  Render management view
 * ************************** */
invController.renderManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav();
    res.render("./inventory/management", {
      title: "Inventory Management",
      nav,
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
    let classificationList = await utilities.buildClassificationList();
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList,
      messages: req.flash()
    });
  } catch (error) {
    console.error("Error rendering add inventory form:", error);
    req.flash('error', 'Failed to render add inventory form');
    res.redirect('/inv/management');
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

module.exports = invController;
