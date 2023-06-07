
const path = require("path");
const User = require("../model/user");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/mailSender");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const OTP = require("../model/otpModel");



const createActivationToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET_KEY, {
      expiresIn: "5m",
    });
  };
  
  exports.createUser=async (req, res) => {
    try {
      console.log(req.file)
      const { name, email, password ,confpassword} = req.body;
      console.log(req.body)
      const userEmail = await User.findOne({ email });
    
  
if(userEmail){
  return res.status(400).json({
    success:false,
    message:'user already present'
  })
}
if(password!==confpassword){
  return res.status(400).json({
    success:false,
    message:'confirm password not matched'
  })
}

      if (req.file) {
        const filename = req.file.filename;
        const filePath = `uploads/${filename}`;
       
        console.log(filePath)
        fs.unlink(filePath, (err) => {
          if (err) {
            console.log(err);
            res.status(500).json({ message: "Error deleting file" });
          }
        });
        
      }
  
      const filename = req.file.filename;
      const fileUrl = path.join(filename);

      console.log(fileUrl)
   
      
  

      		// Find the most recent OTP for the email
		// const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
		// console.log(response);
		// if (response.length === 0) {
		// 	// OTP not found for the email
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: "The OTP is not valid",
		// 	});
		// } else if (otp !== response[0].otp) {
		// 	// Invalid OTP
		// 	return res.status(400).json({
		// 		success: false,
		// 		message: "The OTP is not valid",
		// 	});
		// }

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// // Create the user
		// let approved = "";
		// approved === "Instructor" ? (approved = false) : (approved = true);

		// Create the Additional Profile For User
		// const profileDetails = await Profile.create({
		// 	gender: null,
		// 	dateOfBirth: null,
		// 	about: null,
		// 	contactNumber: null,
		// });
		const user = await User.create({
		  name,
        email,
        password:hashedPassword,
        avatar: fileUrl
		});
    console.log(user)

    let userSave = {
      name:user.name,
      email:user.email,
      avatar:user.avatar
    };

		return res.status(200).json({
			success: true,
			message: "User registered successfully",
			userSave
		});
   
    //   }
    } catch (error) {
      return res.status(400).json({
        success:false,
        message:'error in processing request'
      })
    }
  
  };

  // login user
exports.loginUser=async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)
    if (!email || !password) {
      return res.status(400).json({
        success:false,
        message:'all fields are neccessary'
      })
    }

    const find = await User.findOne({ email })
    console.log(find)


    if (!find) {
     
      return res.status(400).json({
        success:false,
        message:'user not found'
      })

      
    }
    // const isPasswordValid = await bcrypt.compare(password,user.password)

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

    // sendToken(user, 201, res);
  } catch (error) {
    console.log('error ye hai',error)
    return res.status(400).json({
      success:false,
      message:'unable to complete request'
    })
  }
};
