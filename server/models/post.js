const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    images:{
        type: String,
        required: false
    },
    content: {
        type: String,
        required: true
    },
    createAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },

})

modules.exports = mongoose.model('Post', PostSchema)