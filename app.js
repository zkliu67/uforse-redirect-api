const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
require('dotenv').config();

// setup routes
const apiRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const app = express();

/% Set the view engine used in the express server %/
app.set('view engine', 'ejs'); // set global configuration value
app.set('views', 'views'); // Tell the express find templates in './views' folder

// allows for form submission as json file
app.use(bodyParser.urlencoded({extended: false}));

// setup routing
app.use('/from', apiRoutes);
app.use('/admin', adminRoutes);


// connected with database
// for development mode
const mongo_url = 'mongodb+srv://admin:admin@shop.wyugv.mongodb.net/Uforse-redirect-api?retryWrites=true&w=majority';
mongoose.connect(mongo_url)
  .then(result => {
    app.listen(8080);
  })
  .catch(error => console.log(err))