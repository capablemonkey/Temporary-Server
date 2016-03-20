var restler = require('restler');
var uuid = require('node-uuid');
var sslRootCAs = require('ssl-root-cas/latest');
sslRootCAs.inject();
var fs = require('fs');
var request = require('request');
var async = require('async');
var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer({dest:'./uploads/'});
var exec = require('child_process').exec;
var cmd = '/usr/games/fortune | /usr/games/cowsay';
var Constants = require(__dirname + '/Constants.js')

var stlFilePath = "./3dFiles/original.stl";
var myRes = null;

app.get('/', function(req, res) {
    exec(cmd, function(error, stdout, stderr) {
        console.log('Running fortune into cowsay');
        console.log(stdout);
        console.log(stderr);
        if (error != null) console.log(error);
    }).stdout.pipe(res);
});

app.post('/image', upload.single('shapeJS_img'), function(req, res) {
    var uuidJS = uuid.v4();
    myRes = res;
    // console.log(req.file);

    var options = {
        multipart: true,
        headers: {},
        data: {
            shapeJS_img: restler.file('./uploads/' + req.file.filename, null, req.file.size),
            jobID: uuidJS,
            script: Constants.JS_2D_TO_3D
        }
    }
    restler.post(Constants.UPDATE_SCENE_ENDPOINT, options).on('complete', function(response, body) {
        console.log();
        console.log(response);
        console.log();
        //console.log(error);
        // console.log(body);

        get3DModel(uuidJS, body);
    });
});

function get3DModel(uuidJS, body) {
    restler.get(Constants.SAVE_MODEL_CACHED_ENDPOINT + uuidJS, {
        decoding: 'buffer'
    }).on('complete', function(body) {
        fs.writeFile(stlFilePath, body, function(err) {
            if (err) {
                return console.log(err);
            }
            runPythonFixer();
        });
    });
}

function runPythonFixer() {
    // execute python script to fix xml
    exec('cd 3dFiles; sudo blender -b -P import_decimate_export.py; cd ..', function(error, stdout, stderr) {
        console.log('Running python script');
            console.log(error);
            console.log(stdout);
            console.log(stderr);
        if (error) {
            console.log(error);
            console.log(stdout);
            console.log(stderr);
        } else {
            console.log("Success\n");
        }

        runFbxConv();
    });
}

function runFbxConv() {
    // execute fbx-conv
    exec('../conversion-tools/fbx-conv/fbx-conv-lin64 -o g3db ./3dFiles/test.fbx ./3dFiles/test.g3db', function(error, stdout, stderr) {
        console.log('Running fbx-conv');
        if (error) {
            console.log(error);
            console.log(stderr);
        } else {
            console.log("Success\n");
        }
        sendModel();
    });
}

function sendModel() {
    myRes.sendFile("./3dFiles/test.g3db", {root: __dirname}, function(err) {
        if (err) {
            console.log(err);
            myRes.status(err.status || 500).end();
        } else {
            console.log('Sent: test.g3db');
        }
    });
}

app.listen(80, function() {
    console.log('Listening on Port 80');
});
