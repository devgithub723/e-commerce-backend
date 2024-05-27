const { Brand} = require("../model/Brand")

exports.createBrand = async (req, res) => {
    const brands = await Brand(req.body)
    try{
        const responce = await brands.save()
        res.status(200).json(responce)
    }catch (err) {
        res.status(400).json(err)
    }
}

exports.fetchBrand = async (req, res) => {
    try{
        const brands = await Brand.find({})
        res.status(200).json(brands)
    }catch (err) {
        res.status(400).json(err)
    }
}