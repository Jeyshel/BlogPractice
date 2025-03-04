require('dotenv').config()

const express = require('express') // Fixed typo in require
const expressLayouts = require('express-ejs-layouts')
const connectDB = require('./server/config/db')
connectDB()
const app = express()
const PORT = 5000 || process.env.PORT
 
app.use(express.static('public')) 
  
//templating Engine
app.use(expressLayouts)
app.set('layout', './layouts/main')
app.set('view engine','ejs')
 


app.use('/', require('./server/routes/main'))

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`) // Fixed template literal syntax
})