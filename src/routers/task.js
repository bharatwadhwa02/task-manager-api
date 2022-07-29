const express = require('express')
const Task = require('../models/task.js')
const router = new express.Router()
const auth = require('../middleware/auth')


router.post('/tasks',auth , async(req,res)=>{
  // const task = new Task(req.body)

  const task = new Task({
    ...req.body,
    owner:req.user._id
  })
  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(404).send(e)
  }
})
// router.post('/tasks' , (req , res)=>{
//   const task = new Task(req.body)
//   task.save().then(()=>{
//     res.status(201).send(task)
//   }).catch((error)=>{
//     res.status(400).send(error)
//   })
// })



// GET /tasks?completed=true
// GET /tasks?limit=2&skip=2
// GET /tasks?sortBy=createdAt_desc
router.get('/tasks' , auth, async(req,res)=>{
  
  const match = {}
  const sort ={}
  if(req.query.completed ){
    match.completed = req.query.completed === 'true'
  }
  if(req.query.sortBy){
    const parts = req.query.sortBy.split('_')
    sort[parts[0]] = parts[1] === 'desc' ?-1:+1
  }

  try {
    // const tasks = await Task.find({owner:req.user._id })
    // res.status(200).send(tasks)

    //can use this also instead of above 2 lines
    await req.user.populate({
      path:'tasks',
      match,
      options:{
        perDocumentLimit:parseInt(req.query.limit),
        skip:parseInt(req.query.skip),
        sort          //-1 is for descending order(true) and +1 is for ascending order(false)
      }
    })
    res.send(req.user.tasks)    
  } catch (e) {
    res.status(404).send(e)
  }
})
// router.get('/tasks' , (req,res)=>{
//   Task.find({}).then((tasks)=>{
//     res.send(tasks)
//   }).catch((error)=>{
//     res.status(400).send(error)
//   })
// })




// router.get('/tasks/:taskId' , (req,res)=>{
//   const _id =req.params.taskId
//   Task.findById(_id).then((task)=>{
//     if(!task){
//       return res.status(404).send()
//     }

//     res.send(task)
//   }).catch((error)=>{
//     res.status(404).send()
//   })
// })

router.get('/tasks/:taskId' , auth, async(req,res)=>{
  const _id = req.params.taskId
  try {
    // const task = await Task.findById(_id)
    const task = await Task.findOne({_id , owner : req.user._id})
    if(!task){
      return res.status(404).send({error:"cannot find any task"})
    }
    res.send(task)

  } catch (e) {
    res.status(404).send({error:"cannot find any task"})
  }
})

router.patch('/tasks/:taskId',auth , async(req,res)=>{
  const updates = Object.keys(req.body)
  const updatesAllowed = ['description' , 'completed']
  const isValidOperation = updates.every((update)=>{
    return updatesAllowed.includes(update)
  })

  if(!isValidOperation){
    return res.status(404).send({error:"invalid updates"})
  }

  const _id = req.params.taskId
  try {
    const task = await Task.findOne({_id , owner:req.user._id})

    if(!task){
      return res.status(404).send({error:"task not found"})
    }

    updates.forEach((update)=>{
      task[update] = req.body[update]
    })
    task.save()   
    res.send(task)
  } catch (e) {
    res.status(404).send(e)
  }
})

router.delete('/tasks/:taskId', auth , async(req,res)=>{
  const _id = req.params.taskId
  try {
    const task = await Task.findOneAndDelete({_id , owner:req.user._id})
    if(!task){
      return res.status(404).send({error:"task not found"})
    }   
    res.send(task)
  } catch (e) {
    res.status(404).send(e)
  }
})

module.exports = router