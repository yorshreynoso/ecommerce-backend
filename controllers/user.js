const User = require('../models/User');

const userById = async(req, res, next, id) => {
    try {
        const user  = await User.findById(id)
        req.profile = user;

        next();
        
    } catch (error) {
        console.log('user error, maybe not found');
        res.status(400).json({ message:"user eror or maybe not found"});
    }
}

const read = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile);
}

const update = async(req, res) => {
    try {
        const user = await User.findOneAndUpdate({ _id:req.profile._id }, { $set:req.body }, { new:true });
        user.hashed_password = undefined;
        user.salt = undefined;

        res.json(user);


    } catch (error) {
        return res.status(400).json({ error:'You are not authorized to perform this action'});
    }
}

module.exports = {userById, read, update };