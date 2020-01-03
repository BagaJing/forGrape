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
//app.use(multer({dest:'./dist'}).array('file'));
// get method
app.get("/upload",function(req,res){
	res.render('upload',{
		layout: false,
		title: 'upload'
	});
});
//post method
app.post('/upload',function(req,res){
	console.log(req.files[0].originalname);
	var name = req.files[0].originalname;
	fs.readFile(req.files[0].path,function(err,data){
		if(err){
			console.log('Error');
			res.send('upload failed');
		} else{
			var dir = __dirname+'/'+'public/static/images'+'/2017'+'/'+req.files[0].originalname;
			fs.writeFile(dir,data,function(err){
				var unit = {
					filename: req.files[0].originalname,
					dir: dir
				}
				console.log(unit);
			});
			var cache = fs.readdirSync('./dist');
			cache.forEach(function(ele,index){
				fs.unlink('./dist'+'/'+ele,function(err){
					if(err)
						throw err;
					console.log('cache '+ele+' deleted');
				});
			});
			res.send('upload completed');
		}
	});
	
});
var server = app.listen(3000,function(){
	console.log("server running at 3000");
});
