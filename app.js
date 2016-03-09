var restler = require('restler');
var uuid = require('node-uuid');
var sslRootCAs = require('ssl-root-cas/latest');
sslRootCAs.inject();
var fs = require('fs');
var request = require('request');
var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer({dest:'./uploads/'});
var exec = require('child_process').exec;
var cmd = '/usr/games/fortune | /usr/games/cowsay';

app.get('/', function(req, res) {
  exec(cmd, function(error, stdout, stderr) {
      console.log('ayy lmao');
      console.log(stdout);
      console.log(stderr);
      console.log(error);
      res.send(stdout);
    }
  )
});

app.post('/image', upload.single('shapeJS_img'), function(req, res) {
  var uuidJS = uuid.v4();
  console.log(req.file);
  var options = {
    multipart: true,
    //url: 'http://gpu-public-us-east-1b.shapeways.com/service/sws_service_shapejs_rt_v1.0.0/updateScene',
    headers: {},
    data: {
      shapeJS_img: restler.file('./uploads/' + req.file.filename, null, req.file.size),
      jobID: uuidJS,
      script: "function imgChanged(e){return void 0===e.img?null:(imgBox=new Image3D(e.img,20*MM,20*MM,4*MM,vs),imgBox.setBlurWidth(.1*MM),imgBox.setImagePlace(Image3D.IMAGE_PLACE_BOTH),imgBox.setBaseThickness(.5),imgBox.set(\"distanceFactor\",.8),shape.setSource(imgBox),null)}function main(e){var n=11*MM,i=new Box(2*n,2*n,4*MM);new Bounds(-n,n,-n,n,-n,n);return shape=new Scene(i,new Bounds(-n,n,-n,n,-n,n),vs),void 0===e.img?shape:(imgChanged(e),shape)}var uiParams=[{name:\"img\",desc:\"Image Source\",type:\"uri\",onChange:\"imgChanged\"}],vs=.1*MM,imgBox,shape;"
    }
  }
  restler.post('http://gpu-public-us-east-1b.shapeways.com/service/sws_service_shapejs_rt_v1.0.0/updateScene', options).on('complete', function(body) {
    //console.log(response);
    //console.log(error);
    console.log(body);
    res.send('ayy lmao');
    restler.get('http://gpu-public-us-east-1b.shapeways.com/service/sws_service_shapejs_rt_v1.0.0/saveModelCached?jobID=' + uuidJS, {
      decoding: 'buffer'
    }).on('complete', function(body) {
	    fs.writeFile("./3dFiles/output.stl", body, function(err) {
	      if (err) {
		return console.log(err);
	      }
	    });
      });
    console.log('http://gpu-public-us-east-1b.shapeways.com/service/sws_service_shapejs_rt_v1.0.0/saveModelCached?jobID=' + uuidJS);
  });
});

app.listen(80, function() {
  console.log('Ayy port 80 lmao');
});
