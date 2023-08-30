var express = require('express');
var router = express.Router();

const getUserInfo = require(__path_middleware + 'get-user-info')
const getCategory = require(__path_middleware + 'get-category')
const getRandomPost = require(__path_middleware + 'get-radom-post')

router.use('/auth', require('./auth'));
router.use('/',getUserInfo, getCategory,getRandomPost, require('./home'));
router.use('/category', require('./category'));
router.use('/about', require('./about'));
router.use('/contact', require('./contact'));
router.use('/post', require('./post'));

module.exports = router;
