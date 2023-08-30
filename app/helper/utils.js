
/**
 * For
 * prototype
 * Promise  promise.all promise.resolve/ promise.reject
 */


let createStatusFillter = async(currentStatus,collection) =>{
  const currentSchema = require(`./../schema/${collection}`)
    let statusFillter = [
        {name: 'All', value: 'all', count: 0,   class: 'default'},
        {name: 'Active',value: 'active',  count: 0,   class: 'default'},
        {name: 'Inactive', value :'inactive',  count: 0, class: 'default'}
      ];
    for (let index = 0; index < statusFillter.length; index++) {
        let condition = {}
        let item =  statusFillter[index];
        if (item.value !== 'all') { condition = {status:item.value }}
        if (item.value === currentStatus ) {  statusFillter[index].class = 'success'}
    await  currentSchema.count(condition).then((data)=>{
          statusFillter[index].count = data
          })
        }
        return statusFillter;
}

const countCollection = async ( arrKey, collectionModel) =>{
  for (let i = 0; i < arrKey.length; i++) {
    let key = arrKey[i]
    await collectionModel[key].count({}).then((data)=>{
      collectionModel[key] = data
    })
  }
  return collectionModel
}

module.exports = {
    createStatusFillter :createStatusFillter,
    countCollection: countCollection
}