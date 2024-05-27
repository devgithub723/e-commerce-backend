const express = require('express')
const { createUser, updateUser, fetchUserById } = require('../controller/User')
const router = express.Router()
//  /products is already added in base path index.js
router.get("/own", fetchUserById)
      .patch("/:id", updateUser)
exports.router = router