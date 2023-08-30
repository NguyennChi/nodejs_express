var express = require('express');
var router = express.Router();

const routerName = 'category'
const layout = __path_views_frontend + 'frontend'
const folderView = __path_views_frontend + `/pages/${routerName}/`;
const acticlesSchema = require(__path_schema + 'acticles')

router.get('/:id', async function(req, res, next) {
   console.log('vào ');
   let ObjectId = req.params.id

let article = await acticlesSchema.find({status:'active', categoriesId: `${ObjectId}` })


 res.render(`${folderView}index`, { 
    layout: layout,
    top_post: false,
    sildebar: false,
    article
 })
});

module.exports = router;