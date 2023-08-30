
const multer  = require('multer')
var randomstring = require("randomstring");
const path = require('path')
const fs = require('fs');


const uploadFile = (fiel,folderDes='users',fileNameLength =10, fileSizeMb = 1 * 1024 * 1024, fileExtension ='jpeg|jpg|png|gif') =>{

    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, __path_uploads + folderDes + '/')
        },
        filename: function (req, file, cb) {
          cb(null, randomstring.generate(fileNameLength) + path.extname(file.originalname))
        },    
      })
      
      const upload = multer({ 
        storage: storage,
        limits: { fileSize: fileSizeMb }, //mb
        fileFilter: function (req, file, cb) {
          const filetypes = new RegExp(fileExtension)
          const extname = filetypes.test(path.extname(file.originalname).toLowerCase())
          const mimetype = filetypes.test(file.mimetype)
      
          if (mimetype && extname ) {
          return  cb(null, true)
        }
          return cb(null, false);   
         }
       }).single(fiel)
      
       return upload
}
let removeFile = (folder,fileName)=>{
  if (fileName != '' && fileName != undefined) {
    let path = folder + fileName
  if(fs.existsSync( path ))  fs.unlink(path, (err => {if(err) throw err}))
  }
  
}
module.exports={
    upload:uploadFile,
    remove: removeFile
}