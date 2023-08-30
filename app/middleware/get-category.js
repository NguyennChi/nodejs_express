const categoriesSchema = require(__path_schema + 'categories')

module.exports = async (req,res,next)=>{
    let category = await categoriesSchema.find({status:'active'})
                                      .sort({ordering: 'asc'})
  
    res.locals.category = category
    next()
}