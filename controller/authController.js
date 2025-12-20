const bcrypt = require('bcrypt');
const User = require('../models/Users'); 
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Login function
exports.login= catchAsync(
    async (req,res,next)=>{
        const { username, password } = req.body;
        if (!username || !password) {
          return next(new AppError('Please provide username and password', 400));;
                }
       
         const user= await User.findOne({where:{username}});
         if(!user || !(await bcrypt.compare(password,user.password))){
                return next(new AppError('Invalid username or password', 401));
         }
         res.status(200).json({
                message: 'Login successful',
                user: {
                  id: user.id,
                  u: user.userType,
                  usersername: user.username,
                  userTypeID: user.userID,
                  fullName: user.fullName,       
                },
        });
            }
)   ;
