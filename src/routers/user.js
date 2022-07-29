const express = require('express')
const User = require('../models/user.js')
const router = new express.Router()
const auth = require('../middleware/auth.js')
const multer = require('multer')
const sharp =require('sharp')
const {sendWelcomeEmail , sendCancelationEmail} = require('../email/account')

// router.post('/users' , (req , res)=>{
//   const user = new User(req.body)
//   user.save().then(()=>{
//     res.send(user)
//   }).catch((error)=>{
//     res.status(400).send(error)
//   })
// })

router.post('/users' , async(req , res)=>{
  const user = new User(req.body)
  try{
    await user.save()
    sendWelcomeEmail(user.email , user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({user , token})
  }
  catch(e){
    res.status(404).send(e)
  }
})

router.post('/users/login' , async(req,res)=>{
  try {
    const user = await User.findByCrendentials(req.body.email , req.body.password)
    const token = await user.generateAuthToken()
    // res.send({user:user.getPublicProfile() ,token})   // we have to call this method to every router so we changd this method to 'toJSON' while calling so this method apply to every router
    res.send({user , token})
  } catch (e) {
    res.status(404).send(e)
  }
})

router.post('/users/logout' , auth, async(req , res)=>{
  try {
    req.user.tokens = req.user.tokens.filter((currElement)=>{
      return currElement.token !==req.token
    })
    await req.user.save()
    res.send()
  } catch (e) {
    res.status(500).send()    
  }
})

router.post('/users/logoutAll' , auth , async(req,res)=>{
  try {
    req.user.tokens = []
    await req.user.save()
    res.status(200).send()
  } catch (e) {
    res.status(500).send()
  }
})

// router.get('/users' , (req,res)=>{
//   User.find({}).then((users)=>{
//     res.send(users)
//   }).catch((error)=>{
//     res.send(error)
//   })
// })

router.get('/users', async(req,res)=>{
  try {
    const users = await User.find({})
    res.status(404).send(users)
  } catch (e) {
    res.status(404).send()
  }
})

router.get('/users/me' , auth , async(req , res)=>{
  res.send(req.user)
})

// router.get('/users/:userId' , (req ,res)=>{
//   const _id = req.params.userId
//   User.findById(_id).then((user)=>{
//     if(!user){
//       return res.status(404).send()
//     }
//     res.send(user)
//   }).catch((error)=>{
//     res.status(500).send(error)
//   })
// })

// router.get('/users/:userId' , async(req,res)=>{
//   const _id = req.params.userId
//   try {
//     const user = await User.findById(_id)
//     if(!user){
//       res.status(404).send()
//     }
//     res.send(user)    
//   } catch (e) {
//     res.status(404).send(e)
//   }
// })


router.patch('/users/me',auth , async(req,res)=>{
  const updates = Object.keys(req.body)
  const updatesAllowed = ['name' , 'email','age','password']
  const isValidOperation = updates.every((update)=> {
    return updatesAllowed.includes(update)
  
})

  if(!isValidOperation){
    return res.status(400).send({error:'invalid operation'})
  }

  // const _id = req.params.userId
  
  try {
    // const user =await User.findById(req.user._id)
    
    updates.forEach((update)=>{
      req.user[update] = req.body[update]
    })
    await req.user.save()
    
    //const user = await User.findByIdAndUpdate(_id , req.body , {new:true , runValidators:true})
    // if(!user){
    //   return res.status(404).send()
    // }
    res.send(req.user)
  } catch (e) {
    res.status(404).send(e)    
  }
})

router.delete('/users/me',auth , async(req,res)=>{ 
  try {
    // const user = await User.findByIdAndDelete(req.user._id)
    // if(!user){
    //   return res.status(404).send()
    // }

    await req.user.remove()
    sendCancelationEmail(req.user.email , req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})

const upload = multer({
  limits:{
    fileSize:1000000
  },
  fileFilter(req,file,cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      //(!file.originalname.endsWith(.jpg) && !file.originalname.endsWith(.jpeg) && !file.originalname.endsWith(.png)) can use this condition also
      return cb(new Error('please upload an image'))
    }
    cb(undefined,true)

  }
})

router.post('/users/me/avatar' ,auth , upload.single('avatar') , async(req,res)=>{
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
},(error,req,res,next)=>{
  res.status(404).send({error:error.message})
})

router.delete('/users/me/avatar' , auth ,async(req,res)=>{
  try {
    req.user.avatar = undefined
    await req.user.save()
    res.send()

  } catch (e) {
    res.status(400).send(e)
    
  }
})

router.get('/users/:userId/avatar' , async(req,res)=>{
  try {
    const user = await User.findById(req.params.userId)
    if(!user || !user.avatar){
      throw new Error()
    }
    res.set('Content-Type' , 'image/jpg')
    res.send(user.avatar)

  } catch (e) {
    res.status(404).send(e)    
  }
})


module.exports = router