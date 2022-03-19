const Category = require('../models/Category');
const { errorHandler } = require('../helpers/dbErrorHandler');


const categoryById = async(req, res, next, id) => {
    try {
        const category = await Category.findById(id);
        req.category = category;
        next();
        
    } catch (error) {
        res.status(400).json({error:"Category doesnt exist"});
    }
}

const create = async(req, res) => {
    try {
        const category      = await new Category(req.body);
        const categorySaved = await category.save();
        res.json({ categorySaved });
        
    } catch (error) {
        res.status(400).json({ error:errorHandler(error)});
    }
}

const read = (req, res) => {
    return res.json(req.category);
}

const update = async(req, res) => {
    try {
        const category = req.category;
        category.name = req.body.name;
        const categorySaved = await category.save();
        res.json(categorySaved);
        
    } catch (error) {
        res.status(400).json({erro:errorHandler(error)})
    }

}
const remove = async(req, res) => {
    try {
        const category = req.category;
        await category.remove();
        
        res.json({message:"category deleted"});
        
    } catch (error) {
        res.status(400).json({erro:errorHandler(error)})
    }
}
const list = async(req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
         res.status(400).json(errorHandler(error));       
    }
}


module.exports = { create, categoryById, read, update, remove, list };