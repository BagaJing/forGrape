const express = require("express");
const expressHandler = require('express-handlebars');
const fs = require('fs');
const path  = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
var app = express(); 
// static files configuration
app.use(express.static(__dirname+'/public'));
app.engine('html',expressHandler({
	layoutsDir: 'views',
	defaultLayout: 'layout',
	extname: '.html'
}));
app.set('view engine', 'html');

//read local pictures
var root = path.join(__dirname+"/public/static/images");
// decode post
app.use(bodyParser.urlencoded({extended:false}));
//decode post file
app.use(multer({dest:'./dist'}).array('file'));
// get method

function readPics(list,root){
	//console.log(root);
	var pa = fs.readdirSync(root);
	var isFirst = true;
	pa.forEach(function(ele,index){
		var info = fs.statSync(root+"/"+ele);
		if(!info.isDirectory()){
			//console.log("dir "+ele);
			var unit = {};
			unit.name = root.substring(root.lastIndexOf("/")+1) + "/" +ele;
			unit.code = isFirst? 1:2;
			list.push(unit);
			isFirst = !isFirst;
		} else{
			console.log("Directory Found "+ ele);
			readPics(list,root+"/"+ele);
		}
	});
}	
function readYear(){
	var years = new Array();
	var pa  = fs.readdirSync(root);
	pa.forEach(function(ele,index){
		//console.log(ele);
		var info = fs.statSync(root+"/"+ele);
		if(info.isDirectory()){
			years.push(ele);
		}
	});
	return years;
}
//2015-03-08 142337.jpg
function findDir(filename){
	// year and month
	var ym = filename.substring(0,filename.lastIndexOf('-'));
	if(ym == ''||ym.indexOf('-') == -1) return false;
	return ym.substring(0,ym.indexOf('-'));
}
app.get("/show/:year",function(req,res){
	var years = readYear();
	var list = new Array();
	var chosen;
	if(req.params.year == "-1"){
		chosen = years[0];
	}else{
		chosen = req.params.year;
	}
	readPics(list,root+"/"+chosen);
	//console.log(list);
	res.render('index',{
		layout: false,
		title: 'index',
		years,
		list
	});
});

app.get("/upload",function(req,res){
	res.render('upload',{
		layout: false,
		title: 'upload'
	});
});
//post method
app.post('/upload',function(req,res){
	for(var i = 0 ; i < req.files.length; i++){
		var name = req.files[i].originalname;
		var data = fs.readFileSync(req.files[i].path);
		var year = findDir(name);
		console.log(year);
		if(fs.existsSync(__dirname+'/'+'public/static/images/'+year)){
			console.log('dir '+year+' exist');
		} else{
			fs.mkdirSync(__dirname+'/'+'public/static/images/'+year);
			console.log('dir '+year+' created')
		}
		var dir = __dirname+'/'+'public/static/images'+'/'+year+'/'+name;
		fs.writeFileSync(dir,data);
	}
	
	var cache = fs.readdirSync('./dist');
	cache.forEach(function(ele,index){
		fs.unlink('./dist'+'/'+ele,function(err){
			if(err)
				throw err;
			console.log('cache '+ele+' deleted');
		});
	});
	
	//res.send('upload completed');
	res.redirect('/upload');
	
});
var server = app.listen(3000,function(){
	console.log("server running at 3000");
});
