const express = require('express');
const router = express.Router();

const dataModule = require('../../data');

/**GET /
 * HOME
 */
router.get(['', '/home'],(req,res)=>{
    const posts = dataModule.getData('./posts.json');
    const locals = {
        layout: 'layouts/main',
        title: "The Forum",
        description: "Simple Blog created with NodeJs, Express & MongoDB.",
        posts: posts
    }
    res.render('home', locals)
});

/**GET /
 * POST PAGE
 */
router.get('/post-page1', (req, res) => { // testing, fixed post-page num
    const locals = {
        layout: 'layouts/main'
    };
    res.render('post-page', locals);
});

/**GET /
 * LOGIN AND REGISTER
 */
router.get('/login',(req,res)=>{
    res.render('login-register', {
        layout: 'layouts/auth',
        formType: 'login'})
});

router.get('/register',(req,res)=>{
    res.render('login-register', {
        layout: 'layouts/auth',
        formType: 'register'})
});

router.get('/about',(req,res)=>{
    res.render('about')
});

module.exports = router;