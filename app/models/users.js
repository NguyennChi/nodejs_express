

const usersSchema = require(__path_schema + 'users')
const groupsSchema = require(__path_schema + 'groups')
const fs = require('fs');
const fileHelper = require(__path_helper + 'file')
module.exports = {
    listItems: (params,option = null) => {
        let objWhere = {};
        if(params.currentStatus !== 'all'){objWhere = {status:params.currentStatus}}
        if(params.keywork !== ''){objWhere.name =  new RegExp(params.keywork, 'i')}
        let sort = {}
        sort[params.sortFied] = params.sortType
      return  usersSchema
            .find(objWhere)
            .sort(sort)
            .limit(params.pagination.totalItemsPage)
            .skip((params.pagination.currentPage - 1)*params.pagination.totalItemsPage)
    },
    getItems:(id,option = null) =>  {
      return usersSchema.findById(id)
    },
    getItemUserName: async (username,option = null) =>  {
      return await usersSchema.find({status:'active', userName:username})
    },
    countItems:(params, option = null) =>  {
      let objWhere = {};
      if(params.groupID !== 'allvalue') {objWhere['group.id']= params.groupID}
      if(params.currentStatus !== 'all'){objWhere = {status:params.currentStatus}}
      if(params.keywork !== ''){objWhere.name =  new RegExp(params.keywork, 'i')}
       return usersSchema.count(params.objWhere)
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
            return usersSchema.updateOne({_id: id}, data )
        }

        if(option.task == 'update-multi'){
            data.status = currentStatus
            return usersSchema.updateMany({_id:{$in:id}}, data)
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
                await usersSchema.updateOne({_id: cids[index]}, data)
            }
            return Promise.resolve("Success")
        } else {
            return usersSchema.updateOne({_id: cids}, data)
        }
    },
    deleteItems:async (id, option = null) =>  {
      
        if(option.task == 'delete-one'){
         await usersSchema.findById(id).then((item)=>{
          fileHelper.remove("public/uploads/users/", item.avatar)
          return usersSchema.deleteOne({_id: id})
          }) 
        }

        if(option.task == 'delete-multi'){
          if (Array.isArray(id)) {
            for (let index = 0; index < id.length; index++) {
              await usersSchema.findById(id[index]).then((item)=>{
                fileHelper.remove("public/uploads/users/", item.avatar)
              })
            }
          } else {
            fileHelper.remove("public/uploads/users/", item.avatar)
          }       
            return usersSchema.deleteMany({_id:{$in:id}}) 
    }},
    saveItems: (item, option = null)=>{
        if(option.task == 'add'){
            item.created = {
                user_name: 'admin',
                user_id: 0
              }
              item.group = {
                id: item.group_id,
                name: item.group_name
              }
            return  new usersSchema(item).save()
          }
  
          if(option.task == 'edit'){
          return usersSchema.updateOne({_id: item.id},{
            userName: item.userName,
            fullName: item.fullName,
            ordering: parseInt(item.ordering),
            status: item.status,
            editorData: item.editorData,
            avatar : item.avatar,
            group: {
                id: item.group_id,
                name: item.group_name
              },
              modify: {
                user_name: 'admin',
                user_id: 0
              }
              })  
          }

         if(option.task == 'change-group-name'){
         
          return usersSchema.updateMany({'group.id': item.id},{
            group: {
                name: item.name
              }
              })  
          }
        },
  listItemsInSelecbox: (params, option=null)=>{
    return groupsSchema.find({},{id:1, name:1})
  } 
}