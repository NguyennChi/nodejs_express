var express = require('express');
var router = express.Router();
const middleAuthencation = require(__path_middleware + 'auth')



router.use('/',middleAuthencation, require('./home'));


router.use('/dashboard', require('./dashboard'));
router.use('/items', require('./items'));
router.use('/groups', require('./groups'));
router.use('/users', require('./users'));
router.use('/menus', require('./menus'));
router.use('/categories', require('./categories'));
router.use('/acticles', require('./acticles'));
module.exports = router;
