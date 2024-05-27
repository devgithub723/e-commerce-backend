const express = require('express')
const { fetchBrand, createBrand } = require('../controller/Brand')
const router = express.Router()
//  /products is already added in base path index.js
router.get("/", fetchBrand).post("/", createBrand)
exports.router = router