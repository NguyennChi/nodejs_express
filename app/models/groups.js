
const groupsSchema = require(__path_schema + 'groups')
module.exports = {
    listItems: (params, options = null)=>{
        let objWhere = {};
        let sort = {}
        sort[params.sortFied] = params.sortType
        if(params.currentStatus !== 'all'){objWhere = {status:params.currentStatus}}
        if(params.keywork !== ''){objWhere.name =  new RegExp(params.keywork, 'i')}

     return groupsSchema
            .find(objWhere)
            .sort(sort)
            .limit(params.pagination.totalItemsPage)
            .skip((params.pagination.currentPage - 1)*params.pagination.totalItemsPage)
    },
    countItems: (params, options = null)=>{
      return  groupsSchema.count(params.objWhere)
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
           return groupsSchema.updateMany({_id:{$in:id}}, data)
        } 
        if (options.task == 'changeStatus-one') {
            data.status = status
            return groupsSchema.updateOne({_id: id}, data )
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
                await groupsSchema.updateOne({_id: cids[index]}, data)
            }
            Promise.resolve("Success")
        }else{
         
         return groupsSchema.updateOne({_id: cids}, data)
        }
      },
      deleteItems: (id, options=null )=>{
        if (options.task == 'delete-multi') {
           return groupsSchema.deleteMany({_id:{$in:id}})
        } 
        if (options.task == 'delete-one') {
           return  groupsSchema.deleteOne({_id: id})
        }
 
      },
      getItems: (id, option = null)=>{
       return groupsSchema.findById(id)
      },

      saveItems: (item, options = null) =>{
        if (options.task == 'add') {
            item.created = {
              user_name: 'admin',
              user_id: 0
            }
          return  new groupsSchema(item).save()
        } 
        if (options.task == 'edit') {
        return  groupsSchema.updateOne({_id: item.id},{
            name: item.name,
            ordering: parseInt(item.ordering),
            status: item.status,
            editorData:item.editorData,
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
     return groupsSchema.updateOne({_id: id}, data )
    }
}