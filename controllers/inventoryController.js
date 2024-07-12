const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

const inventoryController = {};

/* ***************************
 *  Render the management view
 * ************************** */
inventoryController.renderManagement = async function (req, res, next) {
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
 *  Render the form for adding a new classification
 * ************************** */
inventoryController.renderAddClassification = async function (req, res, next) {
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
inventoryController.processAddClassification = async function (req, res, next) {
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

module.exports = inventoryController;
