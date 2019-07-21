module.exports = {

    checkWallet: (req, res, next) => {

        if (req.user.wallet <= 0) {
            //get the connection object
            let connectionKey = require('./connections');
            // load the razorpay module 
            const razorpay = require('razorpay');
            let instance = new razorpay({
                key_id: connectionKey.razorAppID,
                key_secret: connectionKey.razorAppSecret
            });
            res.render('payment',{
                rz:instance
            })
        } else {
            next();
        }

    }


}