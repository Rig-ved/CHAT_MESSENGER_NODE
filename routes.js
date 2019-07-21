// route definitions

module.exports = function (app) {
    // Load model schemas
    const contactModel = require("./models/contacts");
    const userModel = require("./models/user");
    const passport = require("passport");
    let receiverSection = {};
    const messageModel = require("./models/message");
    // load auth helpers
    const authHelpers = require("./config/login-helpers");
    //  Load the wallet helpers
    const walletHelpers= require('./config/wallet');

    //get the connection object
    let connectionKey = require('./config/connections');

    // load the razorpay module 
    const razorpay = require('razorpay');
     
    let instance = new razorpay({
        key_id: connectionKey.razorAppID,
        key_secret: connectionKey.razorAppSecret
    })
    
    app.use(passport.initialize());
    app.use(passport.session());

    // authentication for facebook
    app.get(
        "/auth/facebook",
        passport.authenticate("facebook", {
            scope: "email"
        })
    );
    // authentication  callback for facebook
    app.get(
        "/auth/facebook/callback",
        passport.authenticate("facebook", {
            failureRedirect: "/"
        }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect("/profile");
        }
    );
    // authentication for google
    app.get(
        "/auth/google",
        passport.authenticate("google", {
            scope: ["email", "profile"]
        })
    );
    // authentication callback for facebook
    app.get(
        "/auth/google/callback",
        passport.authenticate("google", {
            failureRedirect: "/"
        }),
        function (req, res) {
            // Successful authentication, redirect profile.
            res.redirect("/profile");
        }
    );
    // render home template
    app.get("/", authHelpers.ensureGuest, (req, res) => {
        res.render("home");
    });
    // render about template
    app.get("/about", authHelpers.ensureGuest, (req, res) => {
        res.render("about");
    });
    // render contact template
    app.get("/contact", authHelpers.ensureGuest, (req, res) => {
        res.render("contact");
    });
    // render empty template
    app.get("/empty", authHelpers.ensureGuest, (req, res) => {
        res.render("empty");
    });
    // render contact us form template
    app.post("/contactUs", authHelpers.ensureGuest, (req, res) => {
        const dataToSave = {
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
            date: new Date()
        };
        new contactModel(dataToSave).save((err, message) => {
            if (err) {
                throw err;
            } else {
                res.redirect("/success");
            }
        });
    });

    app.get("/inbox", authHelpers.ensureGuest, (req, res) => {
        function randomHsl() {
            return "hsla(" + Math.random() * 360 + ", 100%, 32%, 1)";
        }
        contactModel.find({}).then(contacts => {
            if (contacts) {
                contacts.forEach(item => {
                    item.color = randomHsl();
                });
                res.render("messageContacts", {
                    contacts: contacts.reverse()
                });
            } else {
                res.render("empty");
            }
        });
    });
    app.get("/success", authHelpers.ensureGuest, (req, res) => {
        res.render("success");
    });

    app.get("/logout", (req, res) => {
        req.logout();
        res.redirect("/");
    });

    app.get("/profile", authHelpers.requireLogin, (req, res) => {
        userModel
            .findById({
                _id: req.user._id
            })
            .then(user => {
                res.render("profile", {
                    user: user
                });
            });
    });

    /* List all the users */
    app.get("/users", authHelpers.requireLogin, (req, res) => {
        
        userModel.find({ _id: { $ne:req.user._id } }).then(users => {
            if (users) {
                /* Set user for logged in session*/
                userModel
                    .findById({
                        _id: req.user._id
                    })
                    .then(item => {
                        res.render("users", {
                            users: users,
                            user: item
                        });
                    });
            } else {}
        });
    });

    app.get("/startChat/:id", authHelpers.requireLogin, (req, res) => {
        // set the receiver irrespective
        userModel
                    .findById({
                        _id: req.params.id
                    })
                    .then((item )=> {
                        receiverSection = {
                            id:req.params.id,
                            image:item.image,
                            fullname:item.fullname,
                            wallet:item.wallet,
                            email:item.email
                        }   
                    });
        // check if i received a message            
        messageModel
            .findOne({
                sender: req.params.id,
                receiver: req.user._id
            })
            .then(message => {
                if (message) {
                    message.receiverRead = true;
                    message.senderRead = false;
                    message.save((err, message) => {
                        if (err) throw err;
                        res.redirect(`/chat/${message._id}`);
                    });
                } else {
                    // check if i sent a message 
                    messageModel
                        .findOne({
                            sender: req.user._id,
                            receiver: req.params.id
                        })
                        .then(message => {
                            if (message) {
                                message.receiverRead = false;
                                message.senderRead = true;
                                message.date = new Date();
                                message.save((err, message) => {
                                    if (err) throw err;
                                    res.redirect(`/chat/${message._id}`);
                                });
                            } else {
                                // else i will start a new conversation 
                                const newMessage = {
                                    sender: req.user._id,
                                    senderRead: true,
                                    receiver: req.params.id,
                                    receiverRead: false,
                                    date: new Date()
                                };
                                new messageModel(newMessage).save((err, message) => {
                                    if (err) {
                                        throw err;
                                    }
                                    if (message) {
                                        res.redirect(`/chat/${message._id}`);
                                    }
                                });
                            }
                        });
                }
            });
    });
    // render first time chat room
    app.get("/chat/:id", authHelpers.requireLogin, (req, res) => {
        messageModel
            .findById({
                _id: req.params.id
            })
            .populate("sender")
            .populate("receiver")
            .populate("chats.senderName")
            .populate("chats.receiverName")
            .then((message) => {
                userModel
                    .findOne({
                        _id: req.user._id
                    })
                    .then((user) => {
                        res.render("chatRoom", {
                            message: message,
                            user: user,
                            receiverSection:receiverSection
                        });
                    });
            });
    });
    // send chat message
    app.post('/chat/:id',walletHelpers.checkWallet,(req,res)=>{
        // Find one converation when i send a message if i started the conversation 
        messageModel.findOne({_id:req.params.id,sender:req.user._id})
        .populate("sender")
        .populate("receiver")
        .populate("chats.senderName")
        .populate("chats.receiverName")
        .then((message)=>{
            if(message){
                message.senderRead = true;
                message.receiverRead = false;
                message.date = new Date();
                const newData = {
                    senderName:req.user._id,
                    senderRead:true,
                    receiverRead:false,
                    date:new Date(),
                    senderMessage:req.body.message,
                    receiverName: message.receiver._id
                }
                message.chats.push(newData);
                message.save((err,message)=>{
                    if (err) throw err;
                    messageModel.findOne({_id:message._id})
                    .populate('sender')
                    .populate("receiver")
                    .populate("chats.senderName")
                    .populate("chats.receiverName")
                    .then((message)=>{
                        userModel.findById({_id:req.user._id})
                        .then((user)=>{
                            user.wallet = user.wallet - 1 ;
                            user.save((err,user)=>{
                                if (err) throw err;
                                res.render("chatRoom", {
                                    message: message,
                                    user: user,
                                    receiverSection:receiverSection
                                });    
                            })
                           
                        })
                    })
                   
                })

            } else{
                // if i never started the conversation , somebody sent me message
                messageModel.findOne({_id:req.params.id,receiver:req.user._id})
                .populate("sender")
                .populate("receiver")
                .populate("chats.senderName")
                .populate("chats.receiverName")
                .then((message)=>{
                    message.senderRead = false;
                    message.receiverRead = true;
                    message.date = new Date();
                    const newData = {
                        receiverName:req.user._id,
                        senderName:message.sender._id,
                        senderRead:false,
                        receiverRead:true,
                        date:new Date(),
                        receiverMessage:req.body.message
                    }
                    message.chats.push(newData);
                    message.save((err,message)=>{
                        if (err) throw err;
                        messageModel.findOne({_id:message._id})
                         .populate('sender')
                        .populate("receiver")
                        .populate("chats.senderName")
                        .populate("chats.receiverName")
                        .then((message)=>{
                            userModel.findById({_id:req.user._id})
                            .then((user)=>{
                                user.wallet = user.wallet - 1 ;
                                user.save((err,user)=>{
                                    if (err) throw err;
                                    res.render("chatRoom", {
                                        message: message,
                                        user: user,
                                        receiverSection:receiverSection
                                    });    
                                })
                               
                            })
                        })
                       
                    })
                })   
            }
        })
    })


    // submit card form 
    app.post('/chargeMoney',(req,res)=>{
        
        console.log(req.body);
        const amount = 500;
        const email = req.body.email
        let instance = new razorpay({
            key_id: connectionKey.razorAppID,
            key_secret: connectionKey.razorAppSecret
        });
        instance.payments.capture(req.body.razorpay_payment_id, amount)
        .then((item)=>{
            if(item && item.status === "captured") {
                let charge = {
                    amount:item.amount / 100,
                    currency:item.currency
                }
                instance.customers.create({
                    name:item.card.name, 
                    email:item.email, 
                    contact:item.contact, 
                    notes:item.notes},(err,customer)=>{
                    if(err) throw err;
                    userModel.findById({_id:req.user._id})
                    .then((user)=>{
                        user.wallet +=10;
                        user.save((err,user)=>{
                            if(err) throw err
                            res.render("paymentSuccess", {
                                charge: charge,
                                user: user,
                                receiverSection:receiverSection
                            });
                        })
                    })
                })
            }
           
        })
    })
             
};