const File = require('../models/Files');
const User = require('../models/Users');
const Dep = require('../models/Dep');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const { FILE_UPLOAD_DIR } = process.env;

// Setup storage for uploaded files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(FILE_UPLOAD_DIR, 'uploads', 'files');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// Configure upload middleware
exports.upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: function(req, file, cb) {
    cb(null, true);
  }
}).single('file');

// Create/upload a new file
exports.createFile = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'No file uploaded'
    });
  }

  const { recipientType, recipientId, depId, description ,userId} = req.body;
  
  // Create file record in database
  const file = await File.create({
    filename: req.file.originalname,
    filePath: req.file.path,
    fileSize: req.file.size,
    fileType: req.file.mimetype,
    uploaderId: userId,
    recipientType: recipientType || 'public',
    recipientId: recipientId || null,
    depId: depId || null,
    description: description || null
  });

  res.status(201).json({
    status: 'success',
    data: {
      file
    }
  });
});

// Get all files based on user's access
exports.getAllFiles = catchAsync(async (req, res, next) => {
    const {userId, depId} = req.query;
    // get user own files 
    const userFiles = await File.findAll({
        where: {
            uploaderId: userId
        },
        include: [
            {
                model: User,
                as: 'uploader',
                attributes: ['id',  'fullName', 'userType']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
    // get files shared with user
    const sharedFiles = await File.findAll({
        where: {
            recipientId: userId,
            recipientType: 'user'
        },
        include: [
            {
                model: User,
                as: 'uploader',
                attributes: ['id',  'fullName', 'userType']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
    // get files shared with department
    const depFiles = await File.findAll({
        where: {
            depId: depId
        },
        include: [
            {
                model: User,
                as: 'uploader',
                attributes: ['id',  'fullName', 'userType']
            },
            {
                model: Dep,
                as: 'department',
                attributes: ['id', 'depName']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
    // get public files
    const publicFiles = await File.findAll({
        where: {
            recipientType: 'public'
        },
        include: [
            {
                model: User,
                as: 'uploader',
                attributes: ['id',  'fullName', 'userType']
            }
        ],
        order: [['createdAt', 'DESC']]
    });
    // get account type of use
    const use = await User.findOne({
      where :{
        id : userId
      }
    })
    // get files shared to an account type
    const  accountTypeFiles = await File.findAll({
        where: {
            recipientType: use.userType,
        },
        include: [
            {
                model: User,
                as: 'uploader',
                attributes: ['id',  'fullName', 'userType']
            }
        ],
        order: [['createdAt', 'DESC']]
    })

    // combine all files into one array separating them by type
    const files = [
        {
            type: 'userFiles',
            files: userFiles
        },
        {
            type: 'sharedFiles',
            files: sharedFiles
        },
        {
            type: 'depFiles',
            files: depFiles
        },
        {
            type: 'publicFiles',
            files: publicFiles
        },
        {
            type: use.userType,
            files: accountTypeFiles
        }
    ];

  res.status(200).json({
    status: 'success',
    results: files.length,
    data: {
      files
    }
  });
});



// Download file
exports.downloadFile = catchAsync(async (req, res, next) => {
  const fileId = req.params.id;

  
  const file = await File.findOne({
    where: {
      id: fileId,
      
    }
  });

  if (!file) {
    return res.status(404).json({
      status: 'error',
      message: 'File not found or you do not have access'
    });
  }

  // Check if file exists on disk
  if (!fs.existsSync(file.filePath)) {
    return res.status(404).json({
      status: 'error',
      message: 'File not found on server'
    });
  }

  // Set appropriate headers
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
  res.setHeader('Content-Type', file.fileType);

  // Stream file to response
  const fileStream = fs.createReadStream(file.filePath);
  fileStream.pipe(res);
});

exports.deleteFile = catchAsync(async (req, res, next) => {
  const fileId = req.params.id;
  

  const file = await File.findOne({
    where: {
      id: fileId
        }
  });

  if (!file) {
    return res.status(404).json({
      status: 'error',
      message: 'File not found or you do not have permission to delete'
    });
  }

  // Delete file from database (will trigger beforeDestroy hook)
  await file.destroy();

  res.status(204).json({
    status: 'success',
    data: null
  });
});



// Get files shared directly with the user
exports.getUserFiles = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const files = await File.findAll({
    where: {
      recipientId: userId,
      recipientType: 'user'
    },
    include: [
      {
        model: User,
        as: 'uploader',
        attributes: ['id', 'username', 'name']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    status: 'success',
    results: files.length,
    data: {
      files
    }
  });
});

