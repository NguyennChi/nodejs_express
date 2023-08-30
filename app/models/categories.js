
const categoriesSchema = require(__path_schema + 'categories')
const menusSchema = require(__path_schema + 'menus')
module.exports = {
    listItems: (params, options = null)=>{
        let objWhere = {};
        let sort = {}
        sort[params.sortFied] = params.sortType
        if(params.currentStatus !== 'all'){objWhere = {status:params.currentStatus}}
        if(params.keywork !== ''){objWhere.name =  new RegExp(params.keywork, 'i')}

     return categoriesSchema
            .find(objWhere)
            .sort(sort)
            .limit(params.pagination.totalItemsPage)
            .skip((params.pagination.currentPage - 1)*params.pagination.totalItemsPage)
    },
    countItems: (params, options = null)=>{
      return  categoriesSchema.count(params.objWhere)
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
           return categoriesSchema.updateMany({_id:{$in:id}}, data)
        } 
        if (options.task == 'changeStatus-one') {
            data.status = status
            return categoriesSchema.updateOne({_id: id}, data )
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
                await categoriesSchema.updateOne({_id: cids[index]}, data)
            }
            Promise.resolve("Success")
        }else{
         
         return categoriesSchema.updateOne({_id: cids}, data)
        }
      },
      deleteItems: (id, options=null )=>{
        if (options.task == 'delete-multi') {
           return categoriesSchema.deleteMany({_id:{$in:id}})
        } 
        if (options.task == 'delete-one') {
           return  categoriesSchema.deleteOne({_id: id})
        }
 
      },
      getItems: (id, option = null)=>{
       return categoriesSchema.findById(id)
      },

      saveItems: (item, options = null) =>{
        if (options.task == 'add') {
          console.log(item);
            item.created = {
              user_name: 'admin',
              user_id: 0
            }
            item.menus = {
              id: item.menus_id,
              slug: item.menus_name
            }
          return  new categoriesSchema(item).save()
        } 
        if (options.task == 'edit') {
          console.log('vào');
        return  categoriesSchema.updateOne({_id: item.id},{
            name: item.name,
            ordering: parseInt(item.ordering),
            status: item.status,
            editorData:item.editorData,
            menus: {
              id: item.group_id,
              name: item.group_name
            },
            modify: {
              user_name: 'admin',
              user_id: 0
            }
          })
        }
        if(options.task == 'change-menus-name'){
         
          return categoriesSchema.updateMany({'menus.id': item.id},{
            menus: {
                slug: item.slug
              }
              })  
          }
      },
      listItemsInSelecbox: (params, option=null)=>{
        return menusSchema.find({status:'active'},{id:1, slug:1})
      } 
}