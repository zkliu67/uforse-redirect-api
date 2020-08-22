const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const hpp = require('hpp');
const requestIp = require('request-ip');
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

// protect against HTTP Parameter Pollution attacks
app.use(hpp());

// DB Config
// mongoose.Promise = global.Promise;
// Promise.resolve(app)
//   .then(MongoDBConnection)
//   .catch(err => console.error.bind(console, `MongoDB connection error: ${JSON.stringify(err)}`));

// Database Connection
const mongo_url = process.env.MONGODB_URI ? process.env.MONGODB_URI : require('./config/keys').mongoURI;
mongoose
  .connect(mongo_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('| MongoDB Connected');
    console.log('|--------------------------------------------');
    return app;
  });

// CORS setup for dev
app.use(function(req, res, next) {
  req.client_ip_address = requestIp.getClientIp(req);
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'DELETE, GET, POST, PUT, PATCH');
  next();
});

// setup routing
app.use('/from', apiRoutes);
app.use('/admin', adminRoutes);

// catch 404 and forward to error handler
// app.use((req, res, next) => {
//   const err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handler
// no stacktraces leaked to user unless in development environment
// app.use((err, req, res, next) => {
//   if (err.status === 404) {
//     return otherHelper.sendResponse(res, httpStatus.NOT_FOUND, false, null, err, 'Route Not Found', null);
//   } else {
//     console.log('\x1b[41m', err);
//     AddErrorToLogs(req, res, next, err);
//     return otherHelper.sendResponse(res, httpStatus.INTERNAL_SERVER_ERROR, false, null, err, null, null);
//   }
// });

module.exports = app;

// // connected with database
// // for development mode
// const mongo_url = process.env.MONGODB_URI ? process.env.MONGODB_URI : require('./config/keys').mongoURI
// // const mongo_url = 'mongodb+srv://admin:${process.env.DB_PASSWORD}@shop.wyugv.mongodb.net/${process.env.COLLECTION}?retryWrites=true&w=majority';
// mongoose.connect(mongo_url)
//   .then(result => {
//     app.listen(process.env.PORT || 8080);
//   })
//   .catch(error => console.log(err));

