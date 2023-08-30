const usersModels = require(__path_models + 'users')
var LocalStrategy = require('passport-local');
var md5 = require('md5');

module.exports = (passport)=>{
    passport.use(new LocalStrategy(function verify(username, password, cb) {
        usersModels.getItemUserName(username,null).then((users)=>{
          let user = users[0]
          if(!user){ // user === '' && user === undefined
            console.log('Không tồn tại user này!');
            return cb(null, false)
          } else{
            if(md5(password) !== user.password){
              console.log('Không đúng mật khẩu');
              return cb(null, falsex)
            }else{
              console.log('Đăng nhập ok');
              return cb(null, user)
            }
          } 
        })
      }));
      
      passport.serializeUser(function(user, cb) { // session
        cb(null, user._id);
      });
      
      passport.deserializeUser(function(id, cb) { //
        usersModels.getItems(id,null).then((user)=>{
          return cb(null, user);
        })
      });
}