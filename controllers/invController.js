const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invCont = {};

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  const data = await invModel.getInventoryByClassificationId(classification_id);
  const grid = await utilities.buildClassificationGrid(data);
  let nav = await utilities.getNav();
  const className = data[0].classification_name;
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  });
};

/* ***************************
 *  Build inventory detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
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

module.exports = invCont;
