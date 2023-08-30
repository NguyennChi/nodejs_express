var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// var logger = require('morgan');
const flash = require('express-flash-notification');
const session = require('express-session');
const passport = require('passport')
var expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
var moment = require('moment');

const pathConfig = require('./path')
// define
global.__base = __dirname + '/';
global.__path_app = __base + pathConfig.folder_app + '/';
global.__path_public = __base + pathConfig.folder_public + '/';
global.__path_uploads = __path_public + pathConfig.folder_uploads + '/';
global.__path_config = __path_app +  pathConfig.folder_config + '/';
global.__path_helper = __path_app +  pathConfig.folder_helper + '/';
global.__path_routes = __path_app +  pathConfig.folder_routes + '/';
global.__path_schema= __path_app +  pathConfig.folder_schema + '/';
global.__path_models= __path_app +  pathConfig.folder_models + '/';
global.__path_middleware= __path_app +  pathConfig.folder_middleware + '/';
global.__path_views_backend = __path_app +  pathConfig.folder_views_backend + '/';
global.__path_views_frontend = __path_app +  pathConfig.folder_views_frontend + '/';

const systemConfig = require(__path_config +'/system');
const databaseConfig = require(__path_config + '/database');


mongoose.connect(`mongodb+srv://${databaseConfig.USER_NAME}:${databaseConfig.PASSWORD}@cluster0.iaykfrj.mongodb.net/`);
var db = mongoose.connection;
  db.on('error', ()=>{console.log('connect fail')});
  db.once('open', ()=>{
    console.log("connect success");
  });



var app = express();

app.use(cookieParser());
app.use(session({
  secret: 'csafas',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge:5*60*1000}
}))
require(__path_config +'/passport')(passport) 
app.use(passport.initialize())
app.use(passport.session())

app.use(flash(app, {
  viewName:__path_views_backend + 'elements/notify',
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout',__path_views_backend + 'backend');


// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// locals
app.locals.systemConfig = systemConfig
app.locals.moment = moment;

app.use(`/${systemConfig.prefixAdmin}`, require(__path_routes +'/backend/index'));
app.use(`/${systemConfig.prefixFrontend}`, require(__path_routes +'/frontend/index'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use( async function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  if (systemConfig.env == 'dev') {
    res.status(err.status || 500);
  res.render(__path_views_backend + 'pages/error', { pageTitle: 'File not Found' });
  }
  
  // render the error page
  if (systemConfig.env == 'production') {
    res.status(err.status || 500);
    res.render(__path_views_frontend + 'pages/error', { 
      layout: __path_views_frontend + 'frontend',
      top_post: false,
      sildebar: false,
  });
  }
});

module.exports = app;
