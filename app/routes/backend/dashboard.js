var express = require('express');
var router = express.Router();

const routerName = 'dashboard'
const pageTitle = 'Dashboard Manager '
const folderView = __path_views_backend + `/pages/${routerName}/`;
const {countCollection} = require(__path_helper + 'utils')

const acticlesSchema = require(__path_schema + 'acticles')
const categoriesSchema = require(__path_schema + 'categories')
const groupsSchema = require(__path_schema + 'groups')
const itemsSchema = require(__path_schema + 'items')
const menusSchema = require(__path_schema + 'menus')
const usersSchema = require(__path_schema + 'users')

router.get('/', async function(req, res, next) {
let collectionModel = {
    'Acticle': acticlesSchema,
    'Category': categoriesSchema,
    'Group': groupsSchema,
    'Item': itemsSchema,
    'Menu': menusSchema,
    'Users': usersSchema,
}
collectionModel = await countCollection(Object.keys(collectionModel), collectionModel)
 res.render(`${folderView}index`, { 
    pageTitle: pageTitle,
    count: collectionModel
 })
});

module.exports = router;