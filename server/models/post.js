const { type } = require('express/lib/response')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const PostSchema = new Schema({
    poster:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: false
    },
    community:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: true
    },
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
    createdAt:{
        type: Date,
        default: Date.now
    },
    updatedAt:{
        type: Date,
        default: Date.now
    },
    upvotes:{
        type: Number,
        default: 0,
        required: true
    },
    downvotes:{
        type: Number,
        default: 0,
        required: true
    },
    voted: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique: true
        },
        voteType: {
            type: String,
            enum: ['upvote', 'downvote']
        }
    }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comments' }]
    // Maybe add a voted[] field to track users who already voted, avoid duplicates
})

module.exports = mongoose.model('Post', PostSchema)