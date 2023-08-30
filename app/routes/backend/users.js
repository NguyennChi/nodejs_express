var express = require('express');
var router = express.Router();
const util = require('node:util');
const { body, validationResult } = require('express-validator');

const routerName = 'users'

const usersSchema = require(__path_schema + routerName)
const usersModels = require(__path_models + routerName)
const ultilsHelper = require(__path_helper + 'utils')
const paramHelper = require(__path_helper + 'param')
const fileHelper = require(__path_helper + 'file')
const systemConfig = require(__path_config +'system');
const notifyConfig = require(__path_config + 'notify');

const pageTitle     = 'Users Manager '    
const pageTitleAdd     = pageTitle + 'Add'
const pageTitleEdit     = pageTitle + 'Edit'
const linkIndex 		= '/' + systemConfig.prefixAdmin + '/' + routerName;


const uploadAvatar = fileHelper.upload("avatar", routerName)
const folderView		= __path_views_backend + `pages/${routerName}/`;

// list
router.get('(/status/:status)?', async (req, res, next)=>{
  let params = {}
  params.currentStatus = paramHelper.getParam(req.params, 'status', 'all')
  params.keywork = paramHelper.getParam(req.query, 'keywork', '')
  let statusFillter = await ultilsHelper.createStatusFillter(params.currentStatus, 'users')
 
  params.sortFied = paramHelper.getParam(req.session, 'sort_fied', 'fullName')
  params.sortType = paramHelper.getParam(req.session, 'sort_type', 'asc')
  params.groupID = paramHelper.getParam(req.session, 'group_id', '')
  
  let groupItems = []
  await usersModels.listItemsInSelecbox().then(items=>{
    groupItems = items;
    groupItems.unshift({id: 'allvalue', name: 'All groups'})
  })
  params.pagination = {
        totalItems: 1,
        totalItemsPage: 7,
        currentPage: parseInt(paramHelper.getParam(req.query, 'page', 1)) ,
        pageRanges: 3
  }
    
  await  usersModels.countItems(params).then((data)=>{
    params.pagination.totalItems = data
    })
 
    usersModels.listItems(params)
    .then((items)=>{
       res.render(`${folderView}list`, { 
         pageTitle: pageTitle, 
         items: items,
         statusFillter: statusFillter,
         groupItems: groupItems,
         params:params
       })
     })
});

// change-status
router.get('/change-status/:id/:status', function(req, res, next) {
  let currentStatus = paramHelper.getParam(req.params, 'status', 'active');
  let id = paramHelper.getParam(req.params, 'id', '');
  usersModels.changeStatus(id,currentStatus,{task:'update-one'}).then((result)=>{
    req.flash('success', notifyConfig.CHANGE_STATUS_SUCCESS, linkIndex)
  });
 });

// delete
router.get('/delete/:id', function(req, res, next) {
  let id = paramHelper.getParam(req.params, 'id', '');
  usersModels.deleteItems(id,{task:'delete-one'}).then((result)=>{
    req.flash('success', notifyConfig.DELETE_SUCCESS, linkIndex)
  });
 });


// change-status multi
router.post('/change-status/:status',async (req, res, next) => {
  let currentStatus = paramHelper.getParam(req.params, 'status', 'active');
  usersModels.changeStatus(req.body.cid, currentStatus,{task:'update-multi'}).then((result)=>{
   req.flash('success', util.format(notifyConfig.CHANGE_STATUS_MULTI_SUCCESS, result.matchedCount), linkIndex)
 })
  
 });

 // delete multi
 router.post('/delete', async (req, res, next) => {
  usersModels.deleteItems(req.body.cid, {task:'delete-multi'}).then((result)=>{
    req.flash('success', util.format(notifyConfig.DELETE_MULTI_SUCCESS, result.deletedCount), linkIndex)
  });
 });

// change-odering
router.post('/change-ordering',async (req, res, next) => {
  let cids = req.body.cid
  let oderings = req.body.ordering
  usersModels.changeOrdering(cids, oderings, null).then((result)=>{
  req.flash('success', notifyConfig.CHANGE_ORDERING_SUCCESS, linkIndex)
})

 });


// form
router.get('/form(/:id)?', async function(req, res, next) {
  let id = paramHelper.getParam(req.params, 'id', '');
  let item = {name: '', ordering: '', status: '', group_id: '',group_name: ''}
  let showError = null
  let groupItems = []
  await usersModels.listItemsInSelecbox().then(items=>{
    groupItems = items;
    groupItems.unshift({id: 'novalue', name: 'choose groups'})
  })
if(id === ''){ //add
  res.render(`${folderView}form`, { pageTitle: pageTitleAdd,item: item, showError,groupItems})
}else{
  await usersModels.getItems(id).then((item)=>{
  item.group_id = item.group.id
  item.group_name = item.group.name
  res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item:item, showError,groupItems })
 })
}
 });

// save
 router.post('/save',uploadAvatar, 
 body('userName')
  .isLength({min:5, max:100})
  .withMessage('độ dài phải từ 5 đến 100')
  .custom(async (value, { req }) => {
    return await usersSchema.findOne({name:value}).then(async(user)=>{
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
  .isIn(['novalue'])
  .withMessage(notifyConfig.ERROR_STATUS),
body('group_id')
  .not()
  .isIn(['allvalue'])
  .withMessage(notifyConfig.ERROR_STATUS),
  body('avatar') 
  .custom((value,{req}) => {
		const {image_uploaded , image_old} = req.body;
    console.log(req.body);
		if(!image_uploaded && !image_old) {
			return Promise.reject(notifyConfig.ERROR_NOT_FILE);
		}
  return true;
  }),
 async (req, res, next) => {
// console.log(req.file);
  const errors = validationResult(req);
  req.body = JSON.parse(JSON.stringify(req.body));
  let item = Object.assign(req.body)
  let taskCurrent = (typeof item !== 'undefined' && item.id !== '') ? 'edit' : 'add'

  if (!errors.isEmpty()) {
    
    let pageTitle = (taskCurrent == 'add') ? pageTitleAdd : pageTitleEdit
    if(req.file != undefined) fileHelper.remove("public/uploads/users/", req.file.filename)
    let groupItems = []
      await  usersModels.listItemsInSelecbox().then(items=>{
        groupItems = items;
        groupItems.unshift({id: 'novalue', name: 'choose groups'})
      })
      res.render(`${folderView}form`, { pageTitle, item, showError: errors.errors, groupItems
      })
  } else {
    if (req.file == undefined) { // không upload lại hình
      item.avatar = item.image_old
    } else {
      item.avatar = req.file.filename
      if(taskCurrent == 'edit') fileHelper.remove(`public/uploads/${routerName}/`,item.image_old)
    }
    
    let message = (taskCurrent == 'add') ? notifyConfig.ADD_SUCCESS : notifyConfig.EDIT_SUCCESS
    usersModels.saveItems(item,{task: taskCurrent}).then((result)=>{
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

//  fillter
router.get('/fillter-group/:group_id', async function(req, res, next) {
  req.session.group_id  = paramHelper.getParam(req.params, 'group_id', '');
  res.redirect(linkIndex)
 });


module.exports = router;
