const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const sendMail = require("../utils/mailSender");
const sendToken = require("../utils/jwtToken");
const Shop = require("../model/shop");
const { isAuthenticated, isSeller, isAdmin } = require("../middleware/auth");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendShopToken = require("../utils/shopToken");

exports.createShop=async (req, res) => {
    try {
      const { email } = req.body;
      const sellerEmail = await Shop.findOne({ email });
      
      if (sellerEmail) {
        return res.status(400).json({
          success:false,
          message:'shop already registered'
        })
      }
      
      if (req.file) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: "Error deleting file" });
          }
        });
      
      }
  
  
      const filename = req.file.filename;
      const fileUrl = path.join(filename);
  
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
  
      const seller = {
        name: req.body.name,
        email: email,
        password: hashedPassword,
        avatar: fileUrl,
        address: req.body.address,
        phoneNumber: req.body.phoneNumber,
        zipCode: req.body.zipCode,
      };
  
      // const activationToken = createActivationToken(seller);
  
      // const activationUrl = `https://eshop-tutorial-cefl.vercel.app/seller/activation/${activationToken}`;
  
      // try {
      //   await sendMail({
      //     email: seller.email,
      //     subject: "Activate your Shop",
      //     message: `Hello ${seller.name}, please click on the link to activate your shop: ${activationUrl}`,
      //   });
      //   res.status(201).json({
      //     success: true,
      //     message: `please check your email:- ${seller.email} to activate your shop!`,
      //   });
      // } catch (error) {
      //   return next(new ErrorHandler(error.message, 500));
      // }
  
      const saveShop=await Shop.create(seller)
  
      console.log(saveShop)
      return res.status(201).json({
        success:true,
        messsage:'shop registered',
        saveShop
      })
  
    } catch (error) {
        console.log("ye error hai",error)
      return res.status(400).json({
        success:false,
        message:'unable to process'
      })
    }
  };

  exports.loginShop=async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(req.body)

      if (!email || !password) {
        return res.status(400).json({
          success:false,
          message:'all fields are neccessary'
        })
      }

      const find = await Shop.findOne({ email })

      if (!find) {
        return res.status(400).json({
          success:false,
          message:'shop not registered'
        })
      }

      // const isPasswordValid = await user.comparePassword(password);

      // if (!isPasswordValid) {
      //   return next(
      //     new ErrorHandler("Please provide the correct information", 400)
      //   );
      // }

      if (await bcrypt.compare(password, find.password)) {
        const token = jwt.sign(
          { email: find.email, id: find._id, role: find.role,name:find.name },
          process.env.JWT_SECRET_KEY,
          {
            expiresIn: "24h",
          }
        );
  
        // Save token to user document in database
        // find.token = token;
        // find.password = undefined;
        // Set cookie for token and return success response
        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        };
        res.cookie("token", token, options).status(200).json({
          success: true,
          message: `User Login Success`,
          token,
          find,
        });
      }else
            {
        return res.status(400).json({
          success:false,
          message:'incorrect password'
        })
      }


      // sendShopToken(user, 201, res);
    } catch (error) {
      return res.status(400).json({
        success:false,
        message:'unable to process request'
      })
    }
  };