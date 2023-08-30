var express = require('express');
var router = express.Router();

const routerName = 'post'
const layout = __path_views_frontend + 'frontend'
const folderView = __path_views_frontend + `/pages/${routerName}/`;
const acticlesModels = require(__path_models + 'acticles')



router.get('/:id', async function(req, res, next) {
   // let items = await  acticlesModels.listItemsFrontend(null, {task: 'items-special'})
   let ArticleId = req.params.id

   let itemArticle = await acticlesModels.getItemFrontend(ArticleId, null)
                                    .sort({ordering: 'asc'})

 res.render(`${folderView}index`, { 
    layout: layout,
    top_post: false,
    sildebar: false,
    itemArticle
 })
});

module.exports = router;