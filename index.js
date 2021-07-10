const express = require("express")

const multer = require("multer")

const path = require("path")

const fs = require("fs")

var dir = "public";
var subDirectory = "public/uploads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);

  fs.mkdirSync(subDirectory);
}


const gtts = require("gtts")

const extract = require("pdf-text-extract")

const bodyparser = require("body-parser")

const app = express()
// var connect = require("connect");

// var app = connect().use(connect.static(__dirname + '/public'));

// app.listen(8180);

app.set("view engine","ejs")
app.use(bodyparser.json())

app.use(bodyparser.urlencoded({extended:false}))
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server started at port ${PORT}`));

const pdfFilter = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (ext !== ".pdf") {
    return callback("This Extension is not supported");
  }
  callback(null, true);
};

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

app.get("/pdftoaudio", (req, res) => {
  res.render("pdftoaudio", {
    title:
      "FREE PDF to Audio Mp3 Online Tool | Convert PDF Text to Audio Mp3 Online - FreeMediaTools.com",
  });
});

var pdftoaudioupload = multer({
  storage: storage,
  fileFilter: pdfFilter,
}).single("file");

app.post("/uploadpdftoaudio", (req, res) => {
  pdftoaudioupload(req, res, function (err) {
    if (err) {
      return res.end("Error uploading file.");
    }
    res.json({
      path: req.file.path,
    });
  });
});

app.post("/pdftoaudio", (req, res) => {
  outputfile = Date.now() + "output.txt"
  extract(req.body.path, { splitPages: false }, function (err, text) {
    if (err) {
      console.dir(err);
      return;
    }
    console.log(text);
    fs.writeFileSync(outputfile, text);

    console.log(fs.readFileSync(outputfile,'utf-8'))

    var gttsVoice = new gtts(fs.readFileSync(outputfile,'utf-8'), req.body.language);

    outputFilePath = Date.now() + "output.mp3";


    gttsVoice.save(outputFilePath, function (err, result) {
      if (err) {
        fs.unlinkSync(outputFilePath);
        res.send("An error takes place in generating the audio");
      }
      res.json({
        path: outputFilePath,
      });
    });
  });
});

app.get("/download", (req, res) => {
  var pathoutput = req.query.path;
  console.log(pathoutput);
  var fullpath = path.join(__dirname, pathoutput);
  res.download(fullpath, (err) => {
    if (err) {
      fs.unlinkSync(fullpath);
      res.send(err);
    }
    fs.unlinkSync(fullpath);
  });
});


app.listen(PORT, () => {
  console.log(`App is listening on Port ${PORT}`);
});