const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const {errorHandler} = require('../helpers/dbErrorHandler');

const Product = require('../models/Product');

const create = async(req, res) => {
    //return res.send('hagale parse');
    let form = new formidable.IncomingForm();
    console.log('vamo a calmarnos', form); //pues recibo vacio y se crea jajaj

    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "image could not be uploaded" });
        
        let product = new Product(fields);
        console.log('the product', product);

        if (!files.photo) return res.status(400).json({ error:"There is no photo added" });
        if (files.photo.size > 1000000) return res.status(400).json({ error: "Image should be less than 1mb in size" });
        
        //check for all fields
        const { name, description, price, category, quantity, shipping } = fields;

        if(!name || !description || !price || !category || !quantity || !shipping ) {

            return res.status(400).json({ error:"all fields are necessary"})
        }

        product.photo.data = fs.readFileSync(files.photo.filepath); // change path to filepath
        product.photo.contentType = files.photo.mimetype; // change typt to mimetype
        
        try {
            const productSaved = await product.save();
            res.json(productSaved);

        } catch (error) {
            res.status(400).json({ error: errorHandler(error) });
        }
    });
}


const productById = async(req, res, next, id) => {
    try {
        const product = await Product.findById(id);
        console.log(product);
        
        if(!product) return res.status(400).json({ error:"product not found" });

        req.product = product;
        next();
        
    } catch (error) {
        
        res.status(400).json({ error: 'SOMETING HAPPEND' });
    }
}

// TODO: GET THE PHOTO
const read = (req, res) => {
    req.product.photo = undefined;

    return res.json(req.product);
}

const remove = async(req, res) => {
    let product = req.product;

    try {
        product = await product.remove();
        res.json({product, message:"deleted product"});
        
    } catch (error) {
        res.status(400).json({error: errorHandler(error)});
    }
}

const update = async(req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(400).json({ error: "image could not be uploaded" });

        let product = req.product;

        product = _.extend(product, )

        if (files.photo) {
            if (files.photo.size > 1000000) return res.status(400).json({ error: "Image should be less than 1mb in size" });
            
            //check for all fields
            const { name, description, price, category, quantity, shipping } = fields;

            if(!name || !description || !price || !category || !quantity || !shipping ) {
                return res.status(400).json({ error:"all fields are necessary"})
            }

            product.photo.data = fs.readFileSync(files.photo.filepath); // change path to filepath
            product.photo.contentType = files.photo.mimetype; // change typt to mimetype
        }

        try {
            const productSaved = await product.save();
            res.json(productSaved);

        } catch (error) {
            res.status(400).json({ error: errorHandler(error) });
        }
    });
}


/**
 * sell / arrival
 * 
 * by sell      = /products?sortBy=sold&order=desc&limit=4
 * by arrival   = /products?sortBy=createdAt&order=desc&limit=4
 * 
 * if no params sent, then all products are returned
*/

const list = async(req, res) => {

    let order   = req.query.order   ? req.query.order : 'asc';
    let sortBy  = req.query.sortBy  ? req.query.sortBy: '_id';
    let limit   = req.query.limit   ? parseInt(req.query.limit) : 3;

    try {
        const products = await Product.find()
                .select('-photo')
                .populate('category')
                .sort([[sortBy, order]])
                .limit(limit);
        res.json({products});

    } catch (error) {
        res.json({error: 'Products not found'})
    }
}

/**
 * 
 * it will find the products based on the req product category
 * other products that has the same category, will be returned
 */

const listRelated = async(req, res) => {
    let limit   = req.query.limit   ? parseInt(req.query.limit) : 3;

    try {
        const products = await Product.find({_id:{$ne: req.product}, category:req.product.category}) //$ne not encluded (word reserved by mongo), means search similar product except the one we pass it as parameter
            .limit(limit)
            .populate('category', '_id name');

        res.json(products);
        
    } catch (error) {
        res.json({error:'Products not found'});
    }
}


const listCategories = async(req, res) => {
    try {
        const categories = await Product.distinct('category', {});
        res.json(categories);
    } catch (error) {
        res.status(400).json({error:"category not found"});
    }
}


/**
 * list products by search
 * implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what they want
 */
const listBySearch = async(req, res) => {
    let order   = req.body.order    ? req.body.order    : "desc";
    let sortBy  = req.body.sortBy   ? req.body.sortBy   : "_id";
    let limit   = req.body.limit    ? parseInt(req.body.limit) : 100;
    let skip    = parseInt(req.body.skip);
    let findArgs = {};
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }

    try {
        const data = await Product.find(findArgs)
            .select("-photo")
            .populate("category")
            .sort([[sortBy, order]])
            .skip(skip)
            .limit(limit);
            
        res.json({ size: data.length, data })
        
    } catch (error) {
        return res.status(400).json({ error: "Products not found" });
    }
 
};

const photo = (req, res, next) => {
    if(req.product.photo.data) {
        res.set('Content-Type', req.product.photo.contentType);
        return res.send(req.product.photo.data);
    }
    next();
}


module.exports = { create, productById, read, remove, update, list, listRelated, listCategories, listBySearch, photo }