/* Collection of messages */

const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    sender : {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    senderRead:{
        type:Boolean,
        default:false
    },
    
    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    receiverRead:{
        type:Boolean,
        default:false
    },
    date:{
        type:Date,
        default:Date.now()
    },
    chats:[{
        senderName : {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },senderRead:{
            type:Boolean,
            default:false
        },
        senderMessage:{
            type:String
        },
        receiverMessage:{
            type:String
        },
        receiverRead:{
            type:Boolean,
            default:false
        },
        receiverName : {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        date:{
            type:Date,
            default:Date.now()
        }
    }]
});


module.exports = mongoose.model('MessageSchema',messageSchema);