
const itemsSchema = require(__path_schema + 'items')
module.exports = {
    listItems: (params, options = null)=>{
        let objWhere = {};
        let sort = {}
        sort[params.sortFied] = params.sortType
        if(params.currentStatus !== 'all'){objWhere = {status:params.currentStatus}}
        if(params.keywork !== ''){objWhere.name =  new RegExp(params.keywork, 'i')}

     return itemsSchema
            .find(objWhere)
            .sort(sort)
            .limit(params.pagination.totalItemsPage)
            .skip((params.pagination.currentPage - 1)*params.pagination.totalItemsPage)
    },
    countItems: (params, options = null)=>{
      return  itemsSchema.count(params.objWhere)
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
           return itemsSchema.updateMany({_id:{$in:id}}, data)
        } 
        if (options.task == 'changeStatus-one') {
            data.status = status
            return itemsSchema.updateOne({_id: id}, data )
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
                await itemsSchema.updateOne({_id: cids[index]}, data)
            }
            Promise.resolve("Success")
        }else{
         
         return itemsSchema.updateOne({_id: cids}, data)
        }
      },
      deleteItems: (id, options=null )=>{
        if (options.task == 'delete-multi') {
           return itemsSchema.deleteMany({_id:{$in:id}})
        } 
        if (options.task == 'delete-one') {
           return  itemsSchema.deleteOne({_id: id})
        }
 
      },
      getItems: (id, option = null)=>{
       return itemsSchema.findById(id)
      },

      saveItems: (item, options = null) =>{
        if (options.task == 'add') {
            item.created = {
              user_name: 'admin',
              user_id: 0
            }
          return  new itemsSchema(item).save()
        } 
        if (options.task == 'edit') {
        return  itemsSchema.updateOne({_id: item.id},{
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
      }
}