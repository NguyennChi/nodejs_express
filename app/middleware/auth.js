
const systemConfig = require(__path_config +'system');
const stringHellper = require(__path_helper + 'string')

const linkLogin		= '/' + systemConfig.prefixAdmin + '/auth/login'; // khi sai
const linkNoPerson	=stringHellper.formatLink('/' + systemConfig.prefixFrontend + '/auth/no-permisson') ; 

module.exports = (req,res,next)=>{
    if(req.isAuthenticated()){
        if(req.user.userName === 'Nguyen Chi'){
            next()
        } else {
            res.redirect(linkNoPerson)
        }
    }else{
        res.redirect(linkLogin)
    }
   
}