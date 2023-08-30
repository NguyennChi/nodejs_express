var express = require('express');
var router = express.Router();
const util = require('node:util');
const { body, validationResult } = require('express-validator');

const routerName = 'acticles'
const acticlesSchema = require(__path_schema + routerName)
const acticlesModels = require(__path_models + routerName)
const categoriesSchema = require(__path_schema + 'categories')

const ultilsHelper = require(__path_helper + 'utils')
const paramHelper = require(__path_helper + 'param')
const fileHelper = require(__path_helper + 'file')
const systemConfig = require(__path_config + 'system');
const notifyConfig = require(__path_config + 'notify');

const pageTitle = 'Acticle Manager '
const pageTitleAdd = pageTitle + 'Add'
const pageTitleEdit = pageTitle + 'Edit'

const folderView = __path_views_backend + `/pages/${routerName}/`;
const uploadThumb = fileHelper.upload("thumb", routerName)
const linkIndex = '/' + systemConfig.prefixAdmin + '/' + routerName;

// list
router.get('(/status/:status)?', async (req, res, next) => {
  let params = {}
  params.currentStatus = paramHelper.getParam(req.params, 'status', 'all')
  params.keywork = paramHelper.getParam(req.query, 'keywork', '')
  let statusFillter = await ultilsHelper.createStatusFillter(params.currentStatus, routerName)

  params.sortFied = paramHelper.getParam(req.session, 'sort_fied', 'fullName')
  params.sortType = paramHelper.getParam(req.session, 'sort_type', 'asc')
  params.groupID = paramHelper.getParam(req.session, 'group_id', '')
  let categories = await categoriesSchema.find({ status: 'active' })
  params.pagination = {
    totalItems: 1,
    totalItemsPage: 7,
    currentPage: parseInt(paramHelper.getParam(req.query, 'page', 1)),
    pageRanges: 3
  }

  await acticlesModels.countItems(params).then((data) => {
    params.pagination.totalItems = data
  })

  acticlesModels.listItems(params)
    .then((items) => {
      res.render(`${folderView}list`, {
        pageTitle: pageTitle,
        items: items,
        statusFillter: statusFillter,
        params: params,
        categoriesList: categories
      })
    })
});

// change-status
router.get('/change-status/:id/:status', function (req, res, next) {
  let currentStatus = paramHelper.getParam(req.params, 'status', 'active');
  let id = paramHelper.getParam(req.params, 'id', '');
  acticlesModels.changeStatus(id, currentStatus, { task: 'update-one' }).then((result) => {
    req.flash('success', notifyConfig.CHANGE_STATUS_SUCCESS, linkIndex)
  });
});

// delete
router.get('/delete/:id', function (req, res, next) {
  let id = paramHelper.getParam(req.params, 'id', '');
  acticlesModels.deleteItems(id, { task: 'delete-one' }).then((result) => {
    req.flash('success', notifyConfig.DELETE_SUCCESS, linkIndex)
  });
});


// change-status multi
router.post('/change-status/:status', async (req, res, next) => {
  let currentStatus = paramHelper.getParam(req.params, 'status', 'active');
  acticlesModels.changeStatus(req.body.cid, currentStatus, { task: 'update-multi' }).then((result) => {
    req.flash('success', util.format(notifyConfig.CHANGE_STATUS_MULTI_SUCCESS, result.matchedCount), linkIndex)
  })
});

// delete multi
router.post('/delete', async (req, res, next) => {
  acticlesModels.deleteItems(req.body.cid, { task: 'delete-multi' }).then((result) => {
    req.flash('success', util.format(notifyConfig.DELETE_MULTI_SUCCESS, result.deletedCount), linkIndex)
  });
});

// change-odering
router.post('/change-ordering', async (req, res, next) => {
  let cids = req.body.cid
  let oderings = req.body.ordering
  acticlesModels.changeOrdering(cids, oderings, null).then((result) => {
    req.flash('success', notifyConfig.CHANGE_ORDERING_SUCCESS, linkIndex)
  })
});

// form
router.get('/form(/:id)?', async function (req, res, next) {
  let id = paramHelper.getParam(req.params, 'id', '');
  let item = { name: '', ordering: '', status: '' }
  let showError = null
  let categories = await categoriesSchema.find({ status: 'active' })
  if (id === '') { //add
    res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item: item, showError, categoriesList: categories })
  } else {
    await acticlesModels.getItems(id).then((item) => {
     
      res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item: item, showError,categoriesList: categories })
    })
  }
});

// save
router.post('/save', uploadThumb,
  body('name')
    .isLength({ min: 5, max: 100 })
    .withMessage(util.format(notifyConfig.ERROR_NAME, 5, 100))
    .custom(async (value, { req }) => {
      return await acticlesSchema.findOne({ name: value }).then(async (user) => {
        if (user) {
          return Promise.reject(notifyConfig.ERROR_NAME_DUPPLI)
        }
      });
    }),
  body('ordering')
    .isInt({ min: 0, max: 100 })
    .withMessage(util.format(notifyConfig.ERROR_NAME, 0, 100)),
  body('status')
    .not()
    .isIn(['novalue'])
    .withMessage(notifyConfig.ERROR_STATUS),
  async (req, res, next) => {
    const errors = validationResult(req);
    req.body = JSON.parse(JSON.stringify(req.body));
    let item = Object.assign(req.body)
    let taskCurrent = (typeof item !== 'undefined' && item.id !== '') ? 'edit' : 'add'
    let itemData = {}
    if (req.params.id != undefined) {
      itemData = await acticlesSchema.find({_id: req.params.id })
    }
    if (!errors.isEmpty()) {

      let pageTitle = (taskCurrent == 'add') ? pageTitleAdd : pageTitleEdit
      if (req.file != undefined) fileHelper.remove(`public/uploads/${routerName}/`, req.file.filename)
      let categories = await categoriesSchema.find({ status: 'active' })
      let itemList = (taskCurrent == 'edit') ? itemData : req.body
      res.render(`${folderView}form`, {
        pageTitle,
         item:itemList, 
         showError: errors.errors,
         categoriesList: categories
      })
    } else {
      if (req.file == undefined) { // không upload lại hình
        item.thumb = item.image_old
      } else {
        item.thumb = req.file.filename
        if (taskCurrent == 'edit') fileHelper.remove(`public/uploads/${routerName}/`, item.image_old)
      }

      let message = (taskCurrent == 'add') ? notifyConfig.ADD_SUCCESS : notifyConfig.EDIT_SUCCESS
      if (taskCurrent == 'add') { // add
        await acticlesSchema(item).save().then(async (room) => {
          let acticleArr = await categoriesSchema.findById({ _id: room.categoriesId })
          acticleArr.acticles.push(room)
          await categoriesSchema(acticleArr).save()
          req.flash('success', notifyConfig.ADD_SUCCESS, linkIndex)
        })
      } else { //edit
       acticlesModels.saveItems(item, { task: 'edit' }).then((result) => {
        req.flash('success', notifyConfig.EDIT_SUCCESS, linkIndex)
      });
      }
      
    }
  });

//  sort
router.get('/sort/:sort_fied/:sort_type', async function (req, res, next) {
  req.session.sort_fied = paramHelper.getParam(req.params, 'sort_fied', 'ordering');
  req.session.sort_type = paramHelper.getParam(req.params, 'sort_type', 'asc');
  res.redirect(linkIndex)
});

//  fillter
// router.get('/fillter-group/:group_id', async function (req, res, next) {
//   req.session.group_id = paramHelper.getParam(req.params, 'group_id', '');
//   res.redirect(linkIndex)
// });

// change-position
router.get('/change-position/:id/:position', function (req, res, next) {
  let currentPosition = paramHelper.getParam(req.params, 'position', 'active');
  let id = paramHelper.getParam(req.params, 'id', '');
  acticlesModels.changePosition(id, currentPosition, { task: 'update-one' }).then((result) => {
    req.flash('success', notifyConfig.CHANGE_POSITION_SUCCESS, linkIndex)
  });
});

module.exports = router;
