const express   = require('express');
const app       = express();
const morgan    = require('morgan'); //cachar peticiones http
const cors      = require('cors');
const cookieParser      = require('cookie-parser');
const expressValidator  = require('express-validator');

//import routes
const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/user');
const categoryRoutes= require('./routes/category');
const productRoutes = require('./routes/product');
require('./database');



//middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(expressValidator());
app.use(cors());

//routes middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);

app.get('/api/test', (req, res) => {
    console.log('first entry');
    res.send('received info');
});


//port
const port = process.env.PORT || 3001

//db
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});