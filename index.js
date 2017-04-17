//
var path = require('path');
var url = require('url');

var express = require('express');
var app = express();
var server = require('http').createServer(app);

// 处理post body
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true,limit:'10mb'}));
app.use(bodyParser.json({limit:'10mb'}));

// 静态委托目录
//console.log(__dirname);
app.use('/files', express.static(path.join(__dirname, 'files/')));

server.listen(8880);

var ejs = require("ejs");
app.set('views', __dirname + '/files');
app.set('view engine', 'ejs'); // so you can render('index')

// 监听主页

// 监听读/写愿望
var fsExt = require('fs-extra');
var infoPath = __dirname + '/localinfo.json';
var curFile = fsExt.readJsonSync(infoPath);
if (!curFile)   {
    curFile = {wishArr: [], loginArr: []};
    SaveLocalInfo();
} else {
    if (!curFile.wishArr)       curFile.wishArr = [];
    if (!curFile.loginArr)      curFile.loginArr = [];
    SaveLocalInfo();
}

app.use('/setwish', function(req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

    var paramWish = url.parse(req.url, true).query.wish;
    curFile.wishArr.push(paramWish);
    SaveLocalInfo();

    res.json({
        wish: curFile
    });
});
app.get('/getwish', function(req,res,next) {

    var curDate = new Date().toISOString();
    console.log('getwish time = ' + curDate);
    console.log('getwish ip = ' + getClientIp(req));
    console.log('getwish agent = ' + req.headers["user-agent"]);

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

    //
    var lastWish = "空的";
    if (curFile && curFile.wishArr && curFile.wishArr[curFile.wishArr.length-1] != undefined)
        lastWish = curFile.wishArr[curFile.wishArr.length-1];

    res.json({
        wish: lastWish
    });
});

app.get('/getallwish', function(req,res,next) {

    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

    //
    res.json({
        wishArr: curFile
    });
});


app.get('/', function(req,res,next) {
    //
    //res.render('hellogoodbye', {});
    res.redirect("/files/hellogoodbye.html");
});

//
function SaveLocalInfo() {
    fsExt.writeJsonSync(infoPath, curFile);
}

function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};