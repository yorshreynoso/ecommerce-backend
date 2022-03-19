
const User = require('../models/User');
const jwt = require('jsonwebtoken'); //generate signed token
const expressJwt = require('express-jwt'); // for authorization check
const {errorHandler } = require('../helpers/dbErrorHandler');
require('dotenv').config();

const signup = async(req, res) => {
    try {
        const user = await new User(req.body);
        const saveUser = await user.save();
        saveUser.hashed_password = undefined;
        saveUser.salt = undefined;
        res.json({saveUser});
        
    } catch (error) {
        return res.status(400).json({ error: errorHandler(error) });
    }
}

const signin = async(req, res) => {
    //find the user based on email
    try {
        const { email:emailBody, password } = req.body;
        console.log(emailBody);
        const user = await User.findOne({ email:emailBody });
        console.log('usertl', user);
        
        if(!user) return res.status(400).json({status:false, error:"email or password error"});

        //if user is found make sure the email and password match

        //create authenticate method in user model
        if(!user.authenticate(password)) return res.status(401).json( { error:'email and password incorrect' });



        
        // generate a signed token with user id and secret
        const token = jwt.sign({_id:user._id }, process.env.JWT_SECRET);

        //persist the token as 't' in cookie with expiry date
        res.cookie("t", token, {expire: new Date() + 9999 });

        //return response with user and token to frontend client
        const { _id, name, email, role } = user;

        return res.json( { token, user:{_id, email, name, role }});
 
    } catch (error) {
        // console.log(error);
        res.status(400).json({ status:false, error:true, message:"The email or password doesnt exist"});
    }
}

const signout = (req, res) => {
    console.log(req.cookies);
    res.clearCookie("t");
    res.json( { message:"sign out succes"});
}

const requireSignin = expressJwt({
    secret:process.env.JWT_SECRET,
    algorithms: ["HS256"],
    userProperty:'auth'
});


//auth and admin middleware
const isAuth = (req, res, next) => {
    let user = req.profile && req.auth && req.profile._id === req.auth._id;

    if(user) return res.status(403).json({ error:"access denied"});

    next();
}

const isAdmin = (req, res, next) => {
    if(req.profile.role === 0) return res.status(403).json({message: "Admin resource denied"});

    next();
}




module.exports = { signup, signin, signout, requireSignin, isAdmin, isAuth };
