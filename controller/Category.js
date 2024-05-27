const { Category } = require("../model/Category")

exports.createCategories = async (req, res) => {
    const categories = await Category(req.body)
    try{
        const responce = await categories.save()
        res.status(200).json(responce)
    }catch (err) {
        res.status(400).json(err)
    }
}

exports.fetchCategories = async (req, res) => {
    try{
        const category = await Category.find({})
        res.status(200).json(category)
    }catch (err) {
        res.status(400).json(err)
    }
}