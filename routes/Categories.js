const express = require('express')
const { fetchCategories, createCategories } = require('../controller/Category')
const router = express.Router()
//  /products is already added in base path index.js
router.get("/", fetchCategories).post("/", createCategories)
exports.router = router