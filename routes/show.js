const router = require("express").Router();
const File = require('../models/file');

router.get("/:uuid", async (req, res) => {
    try{
        const file = await File.findOne({ uuid: req.params.uuid});
        if(!file){
            return res.render('download', {error: "Link expired."});
        }
        return res.render('download', {
            uuid: file.uuid,
            filename: file.filename,
            filesize: file.size,
            download: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
        })

    }catch(err){
        return res.render('download', {error: "Something went wrong."});
    }
    
})
module.exports = router;