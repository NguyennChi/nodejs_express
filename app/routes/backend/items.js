var express = require('express');
var router = express.Router();
const util = require('node:util');
const { body, validationResult } = require('express-validator');


const routerName = 'items'

const itemsSchema = require(__path_schema + routerName)
const itemsModels = require(__path_models + routerName)
const ultilsHelper = require(__path_helper + 'utils')
const paramHelper = require(__path_helper + 'param')
const systemConfig = require(__path_config + 'system');
const notifyConfig = require(__path_config + 'notify');


const pageTitle     = 'Items Manager '    
const pageTitleAdd     = pageTitle + 'Add'
const pageTitleEdit     = pageTitle + 'Edit'

const folderView		= __path_views_backend + `/pages/${routerName}/`;
const linkIndex 		= '/' + systemConfig.prefixAdmin + '/' + routerName;
// list
router.get('(/status/:status)?', async (req, res, next)=>{
  let params = {}
  params.currentStatus = paramHelper.getParam(req.params, 'status', 'all')
  params.keywork = paramHelper.getParam(req.query, 'keywork', '')
  let statusFillter = await ultilsHelper.createStatusFillter(params.currentStatus, 'items')  
  params.sortFied = paramHelper.getParam(req.session, 'sort_fied', 'name')
  params.sortType = paramHelper.getParam(req.session, 'sort_type', 'asc')
  params.pagination = {
        totalItems: 1,
        totalItemsPage: 7,
        currentPage: parseInt(paramHelper.getParam(req.query, 'page', 1)) ,
        pageRanges: 3
  }

  await  itemsModels.countItems(params).then((data)=>{
    params.pagination.totalItems = data
    }) 
 itemsModels.listItems(params)
 .then((items)=>{
    res.render(`${folderView}list`, { 
      pageTitle: pageTitle, 
      items: items,
      statusFillter: statusFillter,
      params:params
    })
  })
});

// change-status
router.get('/change-status/:id/:status', function(req, res, next) {
  console.log(req.user.userName);
  let currentStatus = paramHelper.getParam(req.params, 'status', 'active');
  let id = paramHelper.getParam(req.params, 'id', '');
 itemsModels.changeStatus(currentStatus, id, {task: 'changeStatus-one'} ).then((result)=>{
    req.flash('success', notifyConfig.CHANGE_STATUS_SUCCESS, linkIndex)
    });
 });

// delete
router.get('/delete/:id', function(req, res, next) {
  let id = paramHelper.getParam(req.params, 'id', '');
  itemsModels.deleteItems(id, {task: 'delete-one'}).then((result)=>{
    req.flash('success',  notifyConfig.DELETE_SUCCESS, linkIndex)
  });
});


// change-status multi
router.post('/change-status/:status',async (req, res, next) => {
  let currentStatus = paramHelper.getParam(req.params, 'status', 'active');
  itemsModels.changeStatus(currentStatus, req.body.cid, {task: 'changeStatus-multi'}).then((result)=>{
    req.flash('success', util.format(notifyConfig.CHANGE_STATUS_MULTI_SUCCESS, result.matchedCount), linkIndex)
  })
});

 // delete multi
 router.post('/delete', async (req, res, next) => {
  itemsModels.deleteItems(req.body.cid,{task: 'delete-multi'} ).then((result)=>{
    req.flash('success', util.format(notifyConfig.DELETE_MULTI_SUCCESS, result.deletedCount), linkIndex)
  });
});

// change-odering
router.post('/change-ordering',async (req, res, next) => {
  let cids = req.body.cid
  let oderings = req.body.ordering
 itemsModels.changeOrdering(cids,oderings).then((result)=>{
  req.flash('success',notifyConfig.CHANGE_ORDERING_SUCCESS, linkIndex)
 })  
});


// form
router.get('/form(/:id)?', async function(req, res, next) {
  let id = paramHelper.getParam(req.params, 'id', '');
  let item = {name: '', ordering: '', status: ''}
  let showError = null
if(id === ''){
  res.render(`${folderView}form`, { pageTitle: pageTitleAdd,item: item, showError})
}else{
await itemsModels.getItems(id).then((item)=>{
  res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item:item, showError })
 })
}
 });

// save
 router.post('/save', 
 body('name')
  .isLength({min:5, max:100})
  .withMessage(util.format(notifyConfig.ERROR_NAME,5,100))
  .custom(async (value, { req }) => {
    return await itemsSchema.findOne({name:value}).then(async(user)=>{
      if(user){
        return Promise.reject(notifyConfig.ERROR_NAME_DUPPLI)
      }
    });
  }), 
body('ordering')
  .isInt({min:0, max:100})
  .withMessage(util.format(notifyConfig.ERROR_NAME,0,100)),
body('status')
  .not()
  .isIn(['allvalue'])
  .withMessage(notifyConfig.ERROR_STATUS),
 async (req, res, next) => {

  const errors = validationResult(req);
  req.body = JSON.parse(JSON.stringify(req.body));
  let item = Object.assign(req.body)
  let taskCurrent = (typeof item !== 'undefined' && item.id !== '') ? 'edit' : 'add'

  if (!errors.isEmpty()) {
    let pageTitle = (taskCurrent == 'add') ? pageTitleAdd : pageTitleEdit
      res.render(`${folderView}form`, { pageTitle, item, showError: errors.errors
      })
  } else {
    let message = (taskCurrent == 'add') ? notifyConfig.ADD_SUCCESS : notifyConfig.EDIT_SUCCESS
    itemsModels.saveItems(item,{task: taskCurrent}).then((result)=>{
      req.flash('success', message , linkIndex)
    });
  }
 });

//  sort
 router.get('/sort/:sort_fied/:sort_type', async function(req, res, next) {
  req.session.sort_fied  = paramHelper.getParam(req.params, 'sort_fied', 'ordering');
  req.session.sort_type = paramHelper.getParam(req.params, 'sort_type', 'asc');
  res.redirect(linkIndex)
 });
module.exports = router;
