const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    firstname : {
        type:String
    },
    facebook:{
        type:String
    },
    google:{
        type:String
    },
    lastname:{
        type:String
    },
    fullname:{
        type:String
    },
    email:{
        type:String
    },
    image:{
        type:String
    },
    wallet:{
        type:Number,
        default:2
    }
});


module.exports = mongoose.model('User',userSchema);