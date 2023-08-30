

const acticlesSchema = require(__path_schema + 'acticles')
const menusSchema = require(__path_schema + 'menus')
const fs = require('fs');
const fileHelper = require(__path_helper + 'file')
module.exports = {
    listItems: async (params,option = null) => {
        let objWhere = {};
        if(params.currentStatus !== 'all'){objWhere = {status:params.currentStatus}}
        if(params.keywork !== ''){objWhere.name =  new RegExp(params.keywork, 'i')}
        let sort = {}
        sort[params.sortFied] = params.sortType
      return await acticlesSchema
            .find(objWhere)
            .sort(sort)
            .limit(params.pagination.totalItemsPage)
            .skip((params.pagination.currentPage - 1)*params.pagination.totalItemsPage)
    },
    listItemsFrontend: async (params,option = null) => {
      if(option.task == 'items-special') {
        return await acticlesSchema
              .find({status:'active', position: 'active'})
              .sort({ordering: 'asc'})
              .limit(3)
      }

      if(option.task == 'items-news') {
        return await acticlesSchema
              .find({status:'active'})
              .sort({createdAt: 'desc'})
              .limit(5)
            
            
      }

      if(option.task == 'items-random') {
      
        return await acticlesSchema
              .aggregate([
                { $match: { status:'active' } },
                { $project: { id: 1, name: 1, thumb: 1, createdAt: 1 } },
                { $sample: { size: 3 } }
              ])
      }
  },
    getItems:(id,option = null) =>  {
      return acticlesSchema.findById(id)
    },
    getItemFrontend:(id,option = null) =>  {
      return acticlesSchema.findById(id)
    },
    countItems:(params, option = null) =>  {
      let objWhere = {};
      if(params.groupID !== 'allvalue') {objWhere['group.id']= params.groupID}
      if(params.currentStatus !== 'all'){objWhere = {status:params.currentStatus}}
      if(params.keywork !== ''){objWhere.name =  new RegExp(params.keywork, 'i')}
       return acticlesSchema.count(params.objWhere)
    },
    changeStatus:(id,currentStatus, option = null) =>  {
        let status = (currentStatus === 'active') ? 'inactive': 'active'
        let data = {
        //   status: status, 
          modify: {
            user_name: 'admin',
            user_id: 0
          }
        }
        if(option.task == 'update-one'){
            data.status = status
            return acticlesSchema.updateOne({_id: id}, data )
        }

        if(option.task == 'update-multi'){
            data.status = currentStatus
            return acticlesSchema.updateMany({_id:{$in:id}}, data)
        }
    
     },
     changeOrdering: async(cids,oderings, option = null) =>  {
        let data = {
            ordering: parseInt(oderings),
            modify: {
            user_name: 'admin',
            user_id: 0
            }
        }

        if (Array.isArray(cids)) {
           
            for(let index = 0; index < cids.length; index++){
                console.log(index);
                data.ordering = parseInt(oderings[index])
                await acticlesSchema.updateOne({_id: cids[index]}, data)
            }
            return Promise.resolve("Success")
        } else {
            return acticlesSchema.updateOne({_id: cids}, data)
        }
    },
    deleteItems:async (id, option = null) =>  {
      
        if(option.task == 'delete-one'){
         await acticlesSchema.findById(id).then((item)=>{
          fileHelper.remove("public/uploads/users/", item.avatar)
          return acticlesSchema.deleteOne({_id: id})
          }) 
        }

        if(option.task == 'delete-multi'){
          if (Array.isArray(id)) {
            for (let index = 0; index < id.length; index++) {
              await acticlesSchema.findById(id[index]).then((item)=>{
                fileHelper.remove("public/uploads/users/", item.avatar)
              })
            }
          } else {
            fileHelper.remove("public/uploads/users/", item.avatar)
          }       
            return acticlesSchema.deleteMany({_id:{$in:id}}) 
    }},
    saveItems: (item, option = null)=>{
        if(option.task == 'add'){
            item.created = {
                user_name: 'admin',
                user_id: 0
              }
            return  new acticlesSchema(item).save()
          }
  
          if(option.task == 'edit'){
          return acticlesSchema.updateOne({_id: item.id},{
           name: item.name,
            slug: item.slug,
            ordering: parseInt(item.ordering),
            categoriesId: item.categoriesId,
            status: item.status,
            editorData: item.editorData,
            thumb : item.thumb,
            modify: {
                user_name: 'admin',
                user_id: 0
              }
              })  
          }
        },
  listItemsInSelecbox: (params, option=null)=>{
    return menusSchema.find({},{id:1, name:1})
  },
  changePosition:(id,currentPosition, option = null) =>  {
    let position = (currentPosition === 'active') ? 'inactive': 'active'
    let data = {
    //   status: status, 
      modify: {
        user_name: 'admin',
        user_id: 0
      }
    }
    if(option.task == 'update-one'){
        data.position = position
        return acticlesSchema.updateOne({_id: id}, data )
    }

    if(option.task == 'update-multi'){
        data.position = position
        return acticlesSchema.updateMany({_id:{$in:id}}, data)
    }

 }
}