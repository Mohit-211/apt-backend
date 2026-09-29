// const multer = require('multer');
// const path = require('path');

// const PUBLIC_DIR = path.resolve(__dirname, "../../public");

// // Set storage engine
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         if (file.fieldname === 'videos') {
//             cb(null, PUBLIC_DIR + "/uploads/videos");
//         } else if (file.fieldname === 'images') {
//             cb(null, PUBLIC_DIR + "/uploads/images");
//         } else if (file.fieldname === 'gifs') {
//             cb(null, PUBLIC_DIR + "/uploads/gifs");
//         } else if (file.fieldname === 'docs') {
//             cb(null, PUBLIC_DIR + "/uploads/docs");
//         }else if (file.fieldname === 'audios') {
//             cb(null, PUBLIC_DIR + "/uploads/audios");
//         }else {
//             cb(new Error('Invalid fieldname'));
//         }
//     },
//     filename: function (req, file, cb) {
//         const ext = file.mimetype.split("/")[1];
//         cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
//     }
// });

// // Check file type
// function checkFileType(file, cb) {
//     const filetypes = /jpeg|jpg|png|gif|mp4|mov|pdf|mp3|docs?/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);
//     console.log("2222222222222222222222222", extname, mimetype, file.mimetype)
//     if (mimetype && extname) {
//         return cb(null, true);
//     } else {
//         cb('Error: Images, videos, mp3, and PDF, doc, and docx  files only!');
//     }
// }

// // Init upload
// const upload = multer({
//     storage: storage,
//     fileFilter: function (req, file, cb) {
//         checkFileType(file, cb);
//     }
// }).fields([
//     { name: 'gifs', maxCount: 10 },
//     { name: 'images', maxCount: 10 },
//     { name: 'videos', maxCount: 10 },
//     { name: 'docs', maxCount: 10 },
//     { name: 'audios', maxCount: 10 }
// ]);

// module.exports = upload;

const multer = require("multer");
const path = require("path");

const PUBLIC_DIR = path.resolve(__dirname, "../../public");

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "videos") {
      cb(null, PUBLIC_DIR + "/uploads/videos");
    } else if (file.fieldname === "images") {
      cb(null, PUBLIC_DIR + "/uploads/images");
    } else if (file.fieldname === "gifs") {
      cb(null, PUBLIC_DIR + "/uploads/gifs");
    } else if (file.fieldname === "docs") {
      cb(null, PUBLIC_DIR + "/uploads/docs");
    } else if (file.fieldname === "audios") {
      cb(null, PUBLIC_DIR + "/uploads/audios");
    } else {
      cb(new Error("Invalid fieldname"));
    }
  },
  filename: function (req, file, cb) {
    const ext = getFileExtension(file);
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

// Check file type
// Check file type
function checkFileType(file, cb) {
  const allowedFiletypes = [
    "jpeg",
    "jpg",
    "png",
    "gif",
    "mp4",
    "mov",
    "pdf",
    "mp3",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "csv",
  ];

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isValidExtension = allowedFiletypes.includes(
    fileExtension.substring(1)
  );

  const isValidMimeType =
    file.mimetype.startsWith("image/") ||
    file.mimetype.startsWith("video/") ||
    file.mimetype.startsWith("application/pdf") ||
    file.mimetype.startsWith("audio/") ||
    file.mimetype === "application/msword" ||
    file.mimetype === "text/csv" ||
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    file.mimetype === "application/vnd.ms-excel" || // Excel 97-2003
    file.mimetype ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // Excel 2007 and later

  if (isValidExtension && isValidMimeType) {
    return cb(null, true);
  } else {
    cb(
      "Error: Images(.jpeg, .jpg, .png), videos(.mp4, .mov), Audio(.mp3), and Files(.pdf, .doc, .docx, .xls, .xlsx, .csv) only allowed!"
    );
  }
}

function getFileExtension(file) {
  const mimeToExtMap = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/mov": "mov",
    "application/pdf": "pdf",
    "audio/mpeg": "mp3",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",
    "application/vnd.ms-excel": "xls", // Excel 97-2003
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx", // Excel 2007 and later
    "text/csv":"csv" //for csv
  };

  const defaultExtension = "txt"; // Default extension for unknown types
  return mimeToExtMap[file.mimetype] || defaultExtension;
}

// Init upload
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).fields([
  { name: "gifs", maxCount: 10 },
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 10 },
  { name: "docs", maxCount: 10 },
  { name: "audios", maxCount: 10 },
]);

module.exports = upload;
