var express = require('express');
var router = express.Router();

const routerName = 'home'
const layout = __path_views_frontend + 'frontend'
const folderView = __path_views_frontend + `/pages/${routerName}/`;
const acticlesModels = require(__path_models + 'acticles')



router.get('/', async function(req, res, next) {
  let itemsSpecial = []
  let itemsNews = []
  
  await  acticlesModels.listItemsFrontend(null, {task: 'items-special'}).then((items)=>{
      itemsSpecial = items
  })

  await  acticlesModels.listItemsFrontend(null, {task: 'items-news'}).then((items)=>{
    itemsNews = items
})


    res.render(`${folderView}index`, { 
      layout: layout,
      top_post: true,
      sildebar: true,
      items: itemsSpecial,
      itemsNews
   })
 
});

module.exports = router;