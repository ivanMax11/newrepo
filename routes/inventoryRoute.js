const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const { check, validationResult } = require("express-validator");
const utilities = require("../utilities/");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// Route to build inventory details view
router.get("/detail/:inventoryId", invController.buildByInventoryId);

// Route to render the management view
router.get("/management", invController.renderManagement);


// Route to handle inventory item deletion
router.get("/delete/:inv_id", invController.deleteInventory);


// Route to render the add-classification view
router.get("/add-classification", invController.renderAddClassification);
router.post("/add-classification", invController.processAddClassification);

// Renderizar vista de gestión
router.get("/", invController.renderManagement);

// Route to render the add-inventory view
router.get("/add-inventory", invController.renderAddInventory);
router.post(
    "/add-inventory",
    [
        check("inv_make").notEmpty().withMessage("Make is required"),
        check("inv_model").notEmpty().withMessage("Model is required"),
        check("classification_id").notEmpty().withMessage("Classification is required"),
        check("inv_description").notEmpty().withMessage("Description is required")
    ],
    invController.processAddInventory
);

// Route to render the edit management
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Route to render edit inventory view
router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));

router.post("/update/", utilities.handleErrors(invController.updateInventory));



module.exports = router;