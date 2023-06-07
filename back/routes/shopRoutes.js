const express = require("express");
const router=express.Router();
const { upload } = require("../multer");
const { createShop, loginShop } = require('../controller/shopController');

router.post('/register',upload.single("file"),createShop)
router.post('/login',loginShop)
// router.delete('/remove',removeUser)


module.exports=router