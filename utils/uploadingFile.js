const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ResultsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `results`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


const uploadResultFile = multer({ storage: ResultsStorage }).single('resultAttachment');


module.exports = uploadResultFile;
