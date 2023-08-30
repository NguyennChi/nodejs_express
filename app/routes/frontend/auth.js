var express = require('express');
var router = express.Router();
const util = require('node:util');
const { body, validationResult } = require('express-validator');
var passport = require('passport');

const stringHellper = require(__path_helper + 'string')
const routerName = 'auth'

const systemConfig = require(__path_config +'system');

const linkLogin		= stringHellper.formatLink('/' + systemConfig.prefixFrontend + '/auth/login') ; // khi sai //
const linkIndex 		= stringHellper.formatLink('/' + systemConfig.prefixFrontend + '/'); // khi đúng // localhost:4000// 

const folderView		= __path_views_frontend + `pages/${routerName}/login`;
const folderNoPermisson		= __path_views_frontend + `pages/${routerName}/no-permission`;
const layoutLogin		= __path_views_frontend + 'login';

const layoutError	= __path_views_frontend + 'frontend';
const getUserInfo = require(__path_middleware + 'get-user-info')
const getCategory = require(__path_middleware + 'get-category')
const getRandomPost = require(__path_middleware + 'get-radom-post')

// login
router.get('/login', async function(req, res, next) {
  if(req.isAuthenticated()) res.redirect(linkIndex)
  let item = {userName: '', password: ''}
  let showError = null
  res.render(`${folderView}`, {layout: layoutLogin, item, showError})

 });

//  logout
router.get('/logout', async function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect(linkLogin);
  });
});

router.get('/no-permisson',getUserInfo,getCategory,getRandomPost, async function(req, res, next) {
  let item = { name: '', ordering: '', status: '' }
  res.render(`${folderNoPermisson}`,{layout: layoutError, item, top_post: false,
    sildebar: false,
    })
});

// save
 router.post('/login', 
 body('username')
  .isLength({min:3, max:10})
  .withMessage('độ dài phải từ 3 đến 10'), 
  body('password')
  .isLength({min:3, max:10})
  .withMessage('độ dài phải từ 3 đến 10'),
 async (req, res, next) => {
  if(req.isAuthenticated()) res.redirect(linkIndex)
  req.body = JSON.parse(JSON.stringify(req.body));
  let item = Object.assign(req.body)
  const errors = validationResult(req);

  if (!errors.isEmpty) {
    console.log(errors);
    res.render(`${folderView}`, { layout: layoutLogin, item, showError: errors.errors})
  } else {
   console.log('okay');
   passport.authenticate('local', {
    successRedirect: linkIndex, // vào link này khi thành công      /adminTTT/dashboard
    failureRedirect: linkLogin, // vào link này khi thất bại       /adminTTT/auth/login
    failureMessage: true
  }) (req, res, next)
  }
});



module.exports = router;
