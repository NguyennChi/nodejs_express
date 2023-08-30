var express = require('express');
var router = express.Router();
const util = require('node:util');
const { body, validationResult } = require('express-validator');

const routerName = 'menus'

const menusSchema = require(__path_schema + routerName)
const menusModels = require(__path_models + routerName)
const categoriesModels = require(__path_models + 'categories')
const ultilsHelper = require(__path_helper + 'utils')
const paramHelper = require(__path_helper + 'param')
const systemConfig = require(__path_config + 'system');
const notifyConfig = require(__path_config + 'notify');


const pageTitle = 'Menu Manager '
const pageTitleAdd = pageTitle + 'Add'
const pageTitleEdit = pageTitle + 'Edit'

const folderView = __path_views_backend + `/pages/${routerName}/`;
const linkIndex = '/' + systemConfig.prefixAdmin + '/' + routerName;
// list
router.get('(/status/:status)?', async (req, res, next) => {
  let params = {}
  params.currentStatus = paramHelper.getParam(req.params, 'status', 'all')
  params.keywork = paramHelper.getParam(req.query, 'keywork', '')
  let statusFillter = await ultilsHelper.createStatusFillter(params.currentStatus, routerName)
  params.sortFied = paramHelper.getParam(req.session, 'sort_fied', 'name')
  params.sortType = paramHelper.getParam(req.session, 'sort_type', 'asc')

  params.pagination = {
    totalItems: 1,
    totalItemsPage: 7,
    currentPage: parseInt(paramHelper.getParam(req.query, 'page', 1)),
    pageRanges: 3
  }

  await menusModels.countItems(params).then((data) => {
    params.pagination.totalItems = data
  })

  menusModels.listItems(params)
    .then((items) => {
      res.render(`${folderView}list`, {
        pageTitle: pageTitle,
        items: items,
        statusFillter: statusFillter,
        params: params
      })
    })
});

// change-status
router.get('/change-status/:id/:status', function (req, res, next) {
  let currentStatus = paramHelper.getParam(req.params, 'status', 'active');
  let id = paramHelper.getParam(req.params, 'id', '');
  menusModels.changeStatus(currentStatus, id, { task: 'changeStatus-one' }).then((result) => {
    req.flash('success', notifyConfig.CHANGE_STATUS_SUCCESS, linkIndex)
  });
});

// delete
router.get('/delete/:id', function (req, res, next) {
  let id = paramHelper.getParam(req.params, 'id', '');
  menusModels.deleteItems(id, { task: 'delete-one' }).then((result) => {
    req.flash('success', notifyConfig.DELETE_SUCCESS, linkIndex)
  });
});

// change-status multi
router.post('/change-status/:status', async (req, res, next) => {
  let currentStatus = paramHelper.getParam(req.params, 'status', 'active');
  menusModels.changeStatus(currentStatus, req.body.cid, { task: 'changeStatus-multi' }).then((result) => {
    req.flash('success', util.format(notifyConfig.CHANGE_STATUS_MULTI_SUCCESS, result.matchedCount), linkIndex)
  })
});

// delete multi
router.post('/delete', async (req, res, next) => {
  menusModels.deleteItems(req.body.cid, { task: 'delete-multi' }).then((result) => {
    req.flash('success', util.format(notifyConfig.DELETE_MULTI_SUCCESS, result.deletedCount), linkIndex)
  });
});

// change-odering
router.post('/change-ordering', async (req, res, next) => {
  let cids = req.body.cid
  let oderings = req.body.ordering
  menusModels.changeOrdering(cids, oderings).then((result) => {
    req.flash('success', notifyConfig.CHANGE_ORDERING_SUCCESS, linkIndex)
  })
});


// form
router.get('/form(/:id)?', async function (req, res, next) {
  let id = paramHelper.getParam(req.params, 'id', '');
  let item = { name: '', ordering: '', status: '' }
  let showError = null
  if (id === '') {
    res.render(`${folderView}form`, { pageTitle: pageTitleAdd, item: item, showError })
  } else {
    await menusModels.getItems(id).then((item) => {
      res.render(`${folderView}form`, { pageTitle: pageTitleEdit, item: item, showError })
    })
  }
});

// save
router.post('/save',
  body('name')
    .isLength({ min: 5, max: 100 })
    .withMessage(util.format(notifyConfig.ERROR_NAME, 5, 100))
    .custom(async (value, { req }) => {
      return await menusSchema.findOne({ name: value }).then(async (user) => {
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
  body('slug')
    .isSlug()
    .withMessage(notifyConfig.ERROR_SLUG),
  async (req, res, next) => {
    const errors = validationResult(req);
    req.body = JSON.parse(JSON.stringify(req.body));
    let item = Object.assign(req.body)
    let taskCurrent = (typeof item !== 'undefined' && item.id !== '') ? 'edit' : 'add'

    if (!errors.isEmpty()) {
      let pageTitle = (taskCurrent == 'add') ? pageTitleAdd : pageTitleEdit
      res.render(`${folderView}form`, {
        pageTitle, item, showError: errors.errors
      })
    } else {
      let message = (taskCurrent == 'add') ? notifyConfig.ADD_SUCCESS : notifyConfig.EDIT_SUCCESS
      menusModels.saveItems(item, { task: taskCurrent }).then((result) => {
        if (taskCurrent == 'add') {
          req.flash('success', message , linkIndex)
        } else if (taskCurrent == 'edit') categoriesModels.saveItems(item, {task: 'change-menus-name' }).then((result)=>{
        req.flash('success', notifyConfig.EDIT_SUCCESS , linkIndex)
        })
      });
    }
  });

//  sort
router.get('/sort/:sort_fied/:sort_type', async function (req, res, next) {
  req.session.sort_fied = paramHelper.getParam(req.params, 'sort_fied', 'ordering');
  req.session.sort_type = paramHelper.getParam(req.params, 'sort_type', 'asc');
  res.redirect(linkIndex)
});

//  Change - group
// router.get('/change-groups/:id/:group_acp', function (req, res, next) {
//   let currentGroups = paramHelper.getParam(req.params, 'group_acp', 'yes');
//   let id = paramHelper.getParam(req.params, 'id', '');
//   menusModels.changeGroup(currentGroups, id).then((result) => {
//     req.flash('success', notifyConfig.CHANGE_GROUPS_SUCCESS, linkIndex)
//   });
// });

module.exports = router;
