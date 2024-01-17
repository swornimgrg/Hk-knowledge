const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const projectSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    members:[
        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ],
    title:{
        type: String,
        required: true
    },
    text: [{
        type: String,
        required: true
    }],
    completed: {
        type: Boolean
    },
    active:{
        type: Boolean,
        default: false
    }
},
{timestamps : true})

projectSchema.plugin(AutoIncrement,{
    inc_field: 'project',
    id: 'projectNums',
    start_seq:150
})

module.exports = mongoose.model('Project', projectSchema)