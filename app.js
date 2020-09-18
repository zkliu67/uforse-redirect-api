const path = require('path');
const express = require("express");
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require("mongoose");
const session = require('express-session');
const mongodbStore = require('connect-mongodb-session')(session);
const hpp = require('hpp');
const httpStatus = require('http-status');
const requestIp = require('request-ip');
const $ = require('jquery');
require('dotenv').config();
const { sendError } = require('./helper/errorHelper');

const mongo_url = process.env.DEPLOYED === "true" ? `mongodb+srv://admin:${process.env.DB_PASSWORD}@shop.wyugv.mongodb.net/${process.env.TB_NAME}?retryWrites=true&w=majority` : require('./config/keys').mongoURI;

// setup routes
const apiRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');

const app = express();
const store = new mongodbStore({
  uri: mongo_url,
  collection: 'sessions'
});

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    let companyId = "";
    if (req.query.company) {
      companyId = req.query.company
    }
    const extension = (file.originalname).split('.')[1];
    cb(null, "qr-img"+'-'+companyId+'.'+extension);
  }
});

const fileFilter = (req, file, cb) => {
  if (!req.query.company) { cb(null, false); }
  if (file.mimetype === 'image/png'||file.mimetype === 'image/jpg'||file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

/% Set the view engine used in the express server %/
app.set('view engine', 'ejs'); // set global configuration value
app.set('views', 'views'); // Tell the express find templates in './views' folder
// load public folder files
app.use(express.static(path.join(__dirname, 'public'))); // pass a folder for read only
// express-session
const sessionKey = process.env.DEPLOYED === "true" ? process.env.SESSION_KEY : require('./config/keys').sessionSk;
app.use(session({secret: sessionKey, resave: false, saveUninitialized: false, store: store}))
// allows for form submission as json file
app.use(bodyParser.urlencoded({extended: false}));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use('/images', express.static(path.join(__dirname, '/images')));

// protect against HTTP Parameter Pollution attacks
app.use(hpp());

// DB Config
// mongoose.Promise = global.Promise;
// Promise.resolve(app)
//   .then(MongoDBConnection)
//   .catch(err => console.error.bind(console, `MongoDB connection error: ${JSON.stringify(err)}`));

// Database Connection
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
app.use('/', (req, res, next) => {res.redirect('/admin/all-visits');})


// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use((err, req, res, next) => {
  if (err.status === 404) {
    return sendError(res, httpStatus.NOT_FOUND, err, 'Route Not Found');
  } else {
    console.log(err);
    return sendError(res, httpStatus.INTERNAL_SERVER_ERROR, err, null);
  }
});

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

