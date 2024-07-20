const { body, validationResult } = require("express-validator");
const utilities = require(".");
const invModel = require("../models/inventory-model");

const validate = {};

// Validation rules for adding inventory
validate.newInventoryRules = () => {
    return [
      body("inv_make").trim().notEmpty().withMessage("Make is required."),
      body("inv_model").trim().notEmpty().withMessage("Model is required."),
      body("inv_year").trim().isNumeric().withMessage("Year must be a number."),
      body("inv_description").trim().notEmpty().withMessage("Description is required."),
      body("classification_id").trim().notEmpty().withMessage("Classification is required.")
    ];
  };
  
  // Check data and return errors or continue to add
  validate.checkInventoryData = async (req, res, next) => {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      let nav = await utilities.getNav();
      res.render("inventory/add-inventory", {
        title: "Add New Inventory Item",
        nav,
        errors: errors.array(),
        inv_make,
        inv_model,
        inv_year,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_miles,
        inv_color,
        classification_id,
        classificationSelect: await utilities.buildClassificationListHTML()
      });
      return;
    }
    next();
  };
  
  // Validation rules for updating inventory
  validate.updateInventoryRules = () => {
    return [
      body("inv_make").trim().notEmpty().withMessage("Make is required."),
      body("inv_model").trim().notEmpty().withMessage("Model is required."),
      body("inv_year").trim().isNumeric().withMessage("Year must be a number."),
      body("inv_description").trim().notEmpty().withMessage("Description is required."),
      body("classification_id").trim().notEmpty().withMessage("Classification is required.")
    ];
  };
  
  validate.checkUpdateData = async (req, res, next) => {
    const { inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("Validation errors:", errors.array());
      let nav = await utilities.getNav();
      res.render("inventory/edit-inventory", {
        title: `Edit ${inv_make} ${inv_model}`,
        nav,
        errors: errors.array(),
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
        classification_id,
        classificationSelect: await utilities.buildClassificationListHTML()
      });
      return;
    }
    next();
  };
  
  
  module.exports = validate;
  