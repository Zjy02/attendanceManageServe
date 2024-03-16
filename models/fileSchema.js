const mongoose = require('mongoose')

const fileSchema = mongoose.Schema({
  "filename": String,
  "mimetype": String,
  "size": Number,
  "userId": {
    type: Number,
    ref: 'users'
  },    //用户ID
  "createTime": {
    type: Date,
    default: Date.now()
  }
})


module.exports = mongoose.model('files', fileSchema, "files")