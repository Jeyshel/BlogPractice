const express = require('express')
const router = express.Router()
const dataModule = require('../../data')
//Server Model/Schema
const Community = require('../models/Community')
const Post = require('../models/Post')
const User = require('../models/User')
const Comments = require('../models/Comments')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { redirect } = require('express/lib/response')
var ObjectId = require('mongodb').ObjectId;
var loggeduser = null;

/**GET /
 * LOGIN AND REGISTER
 */
const authMiddleware = async (req,res,next) => {
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({message: 'Unauthorized'});
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
            next();
        } catch (error) {
            return res.status(401).json({message: 'Unauthorized'});
        }
}

/**GET /
 * LOGIN AND REGISTER
 */
router.get('/login', async (req,res)=>{
    try {
        res.render('login', {
            layout: 'layouts/auth'})
    } catch (error) {
        console.log(error);
    }
});

router.get('/register', async(req,res)=>{
    try {
        res.render('register', {
            layout: 'layouts/auth'})
    } catch (error) {
        console.log(error);
    }
});

router.get('/myprofile', authMiddleware, async(req,res)=>{
    try {
        const locals = { 
            layout: 'layouts/main',
            title: "The Forum",
            description: "Simple Blog created with NodeJs, Express & MongoDB."
        }
        
        const user = await User.findOne({username: loggeduser.username});
        var userId = user._id.toString();
        const posts = await Post.find({poster: new ObjectId(userId)});
        const comments = await Comments.find({commenter: new ObjectId(userId)});
        communities = await Community.find();

        res.render('myprofile', {
            locals,
            user,
            comments,
            posts,
            communities
            });

    } catch (error) {
        console.log(error);
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});




/**GET /
 * VIEW USER PROFILE 
 */
router.get('/user-profile/:id', async (req, res) => {
    const locals = { 
        layout: 'layouts/main',
        title: "The Forum",
        description: "Simple Blog created with NodeJs, Express & MongoDB."
    }

    try {
        //const postId = new mongoose.Types.ObjectId(req.params.id);
        const user = await User.findById(req.params.id); // returns a single mongoose document 
        const comments = await Comments.find({ commenter: req.params.id }); // returns array of mongoose documents 
        const posts = await Post.find({ poster: req.params.id });
        const communities = await Community.find();
        res.render('user-profile', {locals, user, comments, posts, communities}); // should this be data.toObject()? why
    } catch (error) {
        console.log(error);
    }

    // Note: findById() can take in strings, but find() expects querys enclosed in {object literals}
});


/**POST /
 * LOGIN AND REGISTER
 */
router.post('/login', async (req,res)=>{
    try {


        const { username, password } = req.body;
        
        const user = await User.findOne({username});

        if(!user){
            return res.status(401).json({message: 'Invalid Credentials'});
        } 

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({message: 'Wrong Password'});
        }

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);
        res.cookie('token', token, {
            httpOnly: true
        });
        // Set the logged user in the session
        loggeduser = user;
        res redirect('/myprofile');

    } catch (error) {
        console.log(error);
    }
});

router.post('/register', async (req,res)=>{
    try {
        const { username, password, confirm } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        if (password !== confirm) {
            res.status(408).json({message: 'Passwords do not match'});
        } else {
            try {
                const user = await User.create({
                    username,
                    password: hashedPassword
                });
                res.status(201).json({message: 'User Created', user});
                res.redirect('/login');
            }   catch (error) {
                if(error.code === 11000){
                    res.status(409).json({message: 'Username already exists'});
                }
                res.status(500).json({message: 'Internal Server Error'});
            }
        }
        


    } catch (error) {
        console.log(error);
    }
});

/**POST /
 * ADD COMMENT
 */

router.post('/addcomment/:id', async (req,res)=>{

    let comment = new Comments({
        postId: req.params.id,
        commenter: loggeduser._id,
        comment: req.body.comment
    })

    try {
        comment.save();
        res.redirect("/post/"+req.params.id+"/"+req.params.id.title);
    } catch (error) {
        console.log(error);
    }
});


/**POST /
 * ADD COMMENT
 */

router.post('/addcomment/:id', async (req,res)=>{

    let comment = new Comments({
        postId: req.params.id,
        commenter: loggeduser._id,
        comment: req.body.comment
    })

    try {
        comment.save();
        res.redirect("/post/"+req.params.id+"/"+req.params.id.title);
    } catch (error) {
        console.log(error);
    }
});


/**POST /
 * UPDATE POST
 */
router.post('/update-profile', authMiddleware, async (req, res) => {
    try {
        const { username, description } = req.body;
        const userId = req.userId;

        const updatedUser = await User.findByIdAndUpdate(userId, { username, description }, { new: true });
        
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;