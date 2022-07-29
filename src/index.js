const express = require('express')
require('./db/mongoose')
const User =require('./models/user.js')
const Task = require('./models/task.js')

const app = express()
const port = process.env.PORT
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task.js')

// app.use((req,res,next)=>{
//     res.status(503).send('Site is currently down. Check back soon.')
// })
// app.use((req,res,next)=>{
//   console.log(req.path , req.method)
//   next()
// })
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port , ()=>{
  console.log('server is up on port '+port)
})

// const multer = require('multer')
// const upload = multer({
//   dest:'images',
//   limits:{
//     fileSize:1000000
//   },
  
//   fileFilter(req,file,cb){
//     if(!file.originalname.match(/\.(doc|docx)$/)){ 
//       //we use regular expression instead of using logical OR but both are correct (!file.originalname.endsWith('.doc') && !file.originalname.endsWith('.docx'))
//       return cb(new Error('please upload a WORD file'))
//     }
//     cb(undefined , true)
//   }
// })

// app.post('/upload' ,upload.single('avatar'), (req,res)=>{
//   res.send()
// },(error,req,res,next)=>{
//   res.status(400).send({error: error.message})
// })


// const bcrypt = require('bcryptjs')
// const jwt = require('jsonwebtoken')
// const myfunction = async()=>{
//   // const password = 'bharat02'
//   // const hashedPassword =await bcrypt.hash(password , 8) 
//   // console.log(password)
//   // console.log(hashedPassword)
//   // const isMatch = await bcrypt.compare('bharat02' , hashedPassword)
//   // console.log(isMatch)

//   const token = jwt.sign({_id:'as77qw'} , 'helloguyz',  {expiresIn:'2 second'})   //object and any seriesofcharacters(secret key)
//   console.log(token)

//   const data = jwt.verify(token , 'helloguyz')
//   console.log(data)
// }

// myfunction()


// const pet = {
//   name :'koko'
// }
// pet.toJSON = function(){
//   console.log(this)
//   return {}
// }
// console.log(JSON.stringify(pet))

// const main = async()=>{
//   // const task = await Task.findById('629ba6c68912acb06b07df28').populate('owner').exec()
//   // console.log(task.owner)

//   const user = await User.findById('629f32941ee7745dac09afd3').populate('tasks')
//   console.log(user.tasks)
// }

// main()