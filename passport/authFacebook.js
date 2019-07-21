/* 
   Auth file which will generate for fb authentication
*/


module.exports = function(app) {
    // passport is required for facebook authentication
    const passport = require('passport');
    const keys = require('../config/connections')
    const facebookStrategy = require('passport-facebook').Strategy
    const userModel = require('../models/user')

    // Get fb client secret and fb client ID 
    // Get auth for facebook

    passport.serializeUser((user,done) => {
        done(null,user.id)
    });

    passport.deserializeUser((id,done)=>{
        userModel.findById(id,(err,res)=>{
            done(err,res)
        })
    })

    passport.use(new facebookStrategy({
        clientID:keys.fbAppID,
        clientSecret:keys.fbAppSecret,
        profileFields:['email','displayName','photos'],
        callbackURL:'http://localhost:3000/auth/facebook/callback',
        proxy:true
        },
        function(accessToken,requestToken,profile,done){
            console.log(profile);
            userModel.findOne({facebook:profile.id},(err,user)=>{
                if(err) {
                    return done(err);
                }
                if(user){
                    return done(null,user)
                } else {
                    const newData = {
                        facebook:profile.id,
                        fullname:profile.displayName,
                        image:`https://graph.facebook.com/${profile.id}/picture?type=large`, 
                        email:profile.emails[0].value
                    }
                    new userModel(newData).save((err,user)=>{
                        if(err) {
                            return done(err)
                        } 
                        if(user) {
                            return done(null,user)
                        }
                    })
                }
            })
        }
        ))

}