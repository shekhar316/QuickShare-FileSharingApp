const connectDB = require("./config/db");
const express = require("express");
var cors = require('cors')
const app = express();
const port = process.env.PORT || 8080;
const path = require("path");
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/index.html"));
  });


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
  });
  


app.listen(port, () =>{
    console.log("Server started at http://localhost:" + port);
});

app.use(express.json());
app.set('views', path.join(__dirname, "/views"));
app.set('view engine', 'ejs');
//routes
app.use('/api/files', require('./routes/files'));
app.use('/files', require("./routes/show"));
app.use('/files/download', require("./routes/download"));
app.use(cors());


connectDB();

