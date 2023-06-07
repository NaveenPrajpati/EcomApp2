const express = require("express");
const router=express.Router();
const { upload } = require("../multer");
const { createUser, loginUser } = require('../controller/userController');

router.post('/register',upload.single("file"),createUser)
router.post('/login',loginUser)
// router.delete('/remove',removeUser)


module.exports=router