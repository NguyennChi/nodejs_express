
const menusSchema = require(__path_schema + 'menus')
module.exports = {
    listItems: (params, options = null)=>{
        let objWhere = {};
        let sort = {}
        sort[params.sortFied] = params.sortType
        if(params.currentStatus !== 'all'){objWhere = {status:params.currentStatus}}
        if(params.keywork !== ''){objWhere.name =  new RegExp(params.keywork, 'i')}

     return menusSchema
            .find(objWhere)
            .sort(sort)
            .limit(params.pagination.totalItemsPage)
            .skip((params.pagination.currentPage - 1)*params.pagination.totalItemsPage)
    },
    countItems: (params, options = null)=>{
      return  menusSchema.count(params.objWhere)
    },
    changeStatus: (currentStatus,id, options = null)=>{
        let status = (currentStatus === 'active') ? 'inactive': 'active'
        let data = { 
          modify: {
            user_name: 'admin',
            user_id: 0
          }
        }
        if (options.task == 'changeStatus-multi') {
            data.status = currentStatus
           return menusSchema.updateMany({_id:{$in:id}}, data)
        } 
        if (options.task == 'changeStatus-one') {
            data.status = status
            return menusSchema.updateOne({_id: id}, data )
        }
      },
      changeOrdering: async (cids,oderings, options = null)=>{
        let data = {
            ordering:parseInt(oderings), 
            modify: {
              user_name: 'admin',
              user_id: 0
            }
          }
    
        if(Array.isArray(cids)){
            for (let index = 0; index < cids.length; index++) {
                data.ordering = parseInt(oderings[index])
                await menusSchema.updateOne({_id: cids[index]}, data)
            }
            Promise.resolve("Success")
        }else{
         
         return menusSchema.updateOne({_id: cids}, data)
        }
      },
      deleteItems: (id, options=null )=>{
        if (options.task == 'delete-multi') {
           return menusSchema.deleteMany({_id:{$in:id}})
        } 
        if (options.task == 'delete-one') {
           return  menusSchema.deleteOne({_id: id})
        }
 
      },
      getItems: (id, option = null)=>{
       return menusSchema.findById(id)
      },

      saveItems: (item, options = null) =>{
        if (options.task == 'add') {
            item.created = {
              user_name: 'admin',
              user_id: 0
            },
            item.slug = item.slug
          return  new menusSchema(item).save()
        } 
        if (options.task == 'edit') {
        return  menusSchema.updateOne({_id: item.id},{
            name: item.name,
            ordering: parseInt(item.ordering),
            status: item.status,
            editorData:item.editorData,
            slug: item.slug,
            modify: {
              user_name: 'admin',
              user_id: 0
            }
          })
        }
      },
    changeGroup: (currentGroups,id, option=null)=>{
      let groups = (currentGroups === 'yes') ? 'no': 'yes'
      let data = {
        group_acp: groups, 
        modify: {
          user_name: 'admin',
          user_id: 0
        }
      }
     return menusSchema.updateOne({_id: id}, data )
    },
    
}