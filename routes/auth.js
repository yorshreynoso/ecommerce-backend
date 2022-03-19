const express = require('express');
const router = express.Router();
const { signup, signin, signout, requireSignin } = require('../controllers/auth');
const {userSignupValidator } = require('../validator/index');

router.post('/signup', userSignupValidator, signup, ); //register
router.post('/signin', signin); //login
router.get('/signout', signout); //logout



module.exports = router;