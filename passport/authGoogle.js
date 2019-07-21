/* 
   Auth file which will generate for fb authentication
*/


module.exports = function(app) {
    // passport is required for facebook authentication
    const passport = require('passport');
    const keys = require('../config/connections')
    const googleStrategy = require('passport-google-oauth20').Strategy
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

    passport.use(new googleStrategy({
        clientID:keys.googleAppID,
        clientSecret:keys.googleAppSecret,
        callbackURL:'http://localhost:3000/auth/google/callback'
        },
        function(accessToken,requestToken,profile,done){
            console.log(profile);
             userModel.findOne({google:profile.id},(err,user)=>{
                if(err) {
                    return done(err);
                }
                if(user){
                    return done(null,user)
                } else {
                    const newData = {
                        google:profile.id,
                        fullname:profile.displayName,
                        lastname:profile.name.familyName,
                        firstname:profile.name.givenName,
                        image:profile.photos[0].value+'?sz=200', 
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