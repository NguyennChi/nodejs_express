const acticlesModels = require(__path_models + 'acticles')

module.exports = async (req,res,next)=>{
    let itemsRandom = []
    await  acticlesModels.listItemsFrontend(null, {task: 'items-random'})
    .then((items)=>{
       res.locals.itemsRandom = items
      })
    next()
}