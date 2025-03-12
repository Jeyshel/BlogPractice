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
const multer = require('multer')
var ObjectId = require('mongodb').ObjectId;
var loggeduser = null;
const { getUser } = require('../middleware/auth');

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


// Set up multer for file uploads (Profile Picture)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });
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
        res.redirect('/myprofile');

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

router.post('/addcomment/:id', authMiddleware, async (req,res)=>{
    try {
        const user = await getUser(req);
        if (!user) {
            return res.redirect('/login');
        }

        let comment = new Comments({
            postId: req.params.id,
            commenter: user._id,
            comment: req.body.comment
        });

        await comment.save();
        res.redirect(`/post/${req.params.id}/${req.params.title}`);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


/**POST /
 * DELETE COMMENT
 */
router.post('/delete-comment/:id', authMiddleware, async (req, res) => {
    try {
        const commentId = req.params.id;
        const comment = await Comments.findById(commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        await Comments.findByIdAndDelete(commentId);
        res.redirect('back');
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**POST /
 * UPDATE PROFILE
 */
router.post('/update-profile/:id', authMiddleware, upload.single('image'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.redirect('/login');
        }

        const { username, description } = req.body;
        user.username = username;
        user.description = description;

        if (req.file) {
            user.picture = `/uploads/${req.file.filename}`;
        }

        await user.save();
        res.redirect('/login');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// UPVOTES AND DOWNVOTES
router.post('/post/upvote/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        const user = loggeduser;
        var found = false; // if current user has voted on post
        
        //iterate through array
        post.voted.forEach(voter => {
            if(voter.user.toString() === user._id.toString()){ // if user has voted
                post.upvotes -= 1;
                post.voted.pull({user: user._id});
                found = true;
            }
        });

        if(!found){ // if user has not voted
            post.upvotes += 1;
            post.voted.push({user: user._id});
            found = true;
        }

        await post.save();
        res.json({ success: true, upvotes: post.upvotes, downvotes: post.downvotes });

    } catch (error) {
        console.error('Error upvoting post:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// router.post('/post/upvote/:id', async (req, res) => {
//     try {
//         const postId = req.params.id;
//         const post = await Post.findById(postId);
//         const user = loggeduser;
//         var found = false;
        
//         post.voters.filter(voter => {
//             if(voter.user.toString() === user._id.toString()){
//                 if(voter.voteType === 'upvote'){
//                     post.upvotes -= 1;
//                     post.voters.pull({user: user._id, voteType: 'upvote'});
//                     found = true;
//                 } else if (voter.voteType === 'downvote'){
//                     post.upvotes += 1;
//                     post.downvotes -= 1;
//                     post.voters.pull({user: user._id, voteType: 'downvote'});
//                     post.voters.push({user: user._id, voteType: 'upvote'});
//                     found = true;
//                 }
//             }
//         });
    
//         if(!found){
//             post.upvotes += 1;
//             post.voters.push({user: user._id, voteType: 'upvote'});
            
//         }
//         await post.save();
//         res.json({ success: true, upvotes: post.upvotes, downvotes: post.downvotes });

//     } catch (error) {
//         console.error('Error upvoting post:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

// router.post('/post/downvote/:id', async (req, res) => {
//     try {
//         const postId = req.params.id;
//         const post = await Post.findById(postId);
//         const user = loggeduser;
//         var found = false;
        
//         post.voters.filter(voter => {
//             if(voter.user.toString() === user._id.toString()){
//                 if(voter.voteType === 'downvote'){
//                     post.downvotes -= 1;
//                     post.voters.pull({user: user._id, voteType: 'downvote'});
//                     found = true;
//                 } else if (voter.voteType === 'upvote'){
//                     post.downvotes += 1;
//                     post.upvotes -= 1;
//                     post.voters.pull({user: user._id, voteType: 'upvote'});
//                     post.voters.push({user: user._id, voteType: 'downvote'});
//                     found = true;
//                 }
//             }
//         });
    
//         if(!found){
//             post.downvotes += 1;
//             post.voters.push({user: user._id, voteType: 'downvote'});
            
//         }
//         await post.save();
//         res.json({ success: true, downvotes: post.downvotes, upvotes: post.upvotes });

//     } catch (error) {
//         console.error('Error downvoting post:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

module.exports = router;