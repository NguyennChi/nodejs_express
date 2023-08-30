var express = require('express');
var router = express.Router();


router.get('/', function(req, res, next) {
 res.render(__path_views_backend +'pages/home/index', { pageTitle: 'Home Manager' })
});

module.exports = router;