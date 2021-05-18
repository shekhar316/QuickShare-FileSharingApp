const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage: storage,
  limit: { fileSize: 100000 * 100 },
}).single("myFile");

router.post("/", (req, res) => {
  //store
  upload(req, res, async (err) => {
    if (!req.file) {
      return res.json({ err: "All fields are required." });
    }

    if (err) {
      return res.status(500).send({ error: err.message });
    }

    const file = new File({
      filename: req.file.filename,
      uuid: uuid4(),
      path: req.file.path,
      size: req.file.size,
    });

    const response = await file.save();
    return res.json({
      file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
    });
  });

  // db

  // link
});

router.post("/send", async (req, res) => {

    // console.log(req.body);
    // return res.send({});
  const { uuid, emailTo, emailFrom} = req.body;
//   console.log(data);
  if (!uuid || !emailTo || !emailFrom) {
    return res.status(422).send({ error: "All fields are required." });
  }

  try {
    const file = await File.findOne({ uuid: uuid });
    
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();
    // send mail
    const sendMail = require("../services/emailServices");
    sendMail({
      from: emailFrom,
      to: emailTo,
      subject: "QuickShare file sharing",
      text: `${emailFrom} shared a file with you.`,
      html: require("../services/emailTemplate")({
        emailFrom,
        downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}?source=email`,
        size: parseInt(file.size / 1000) + " KB",
        expires: "24 hours",
      }),
    })
      .then(() => {
        return res.json({ success: true });
      })
      .catch((err) => {
        return res.status(500).json({ error: "Error in sending Email." + err  });
      });
  } catch (err) {
    return res.status(500).send({ error: "Something went wrong." + err });
  }
});

module.exports = router;
