var AlexaAppServer = require("alexa-wikia-app-server");
var applicationId = 'amzn1.ask.skill.76b892c2-cbe7-4cb4-9e09-834578411626';
// const verifier = require('alexa-verifier')

// var express = require('express');
// var bodyParser = require('body-parser');
// var request = require('request');
const verifier = require('alexa-verifier');

// var app = express();


AlexaAppServer.start({
	server_root:__dirname,     // Path to root
	public_html:"/public_html", // Static content
	app_dir:"/apps",            // Where alexa-app modules are stored
	app_root:"/",        // Service root
	verify: true,
	port:process.env.PORT
  
  
	
	// Use preRequest to load user data on each request and add it to the request json.
	// In reality, this data would come from a db or files, etc.
	,preRequest: function(json,req,res) {
		// console.log("preRequest fired");
		//json.userDetails = { "name":"Bob Smith" };

    try {
      req.body = JSON.parse(req.rawBody);
    } catch (error) {
      er = error;
      req.body = {};
    }

    var cert_url, er, error, requestBody, signature;

//     var express = require('express');
//     // console.log("Another damn test" + express.headers.signature);
    
    
    //get the information needed to verify the request
    cert_url = req.headers.signaturecertchainurl;
    signature = req.headers.signature;
    requestBody = req.rawBody;
    
    
    if (!req.headers.signaturecertchainurl || req.headers.signaturecertchainurl == undefined) {
      console.error('missing SignatureCertChainUrl header:', er);

      res.status(400).json({ status: 'failure1', reason: er });
      req.session.destroy();
      return false;
    }
    
    if (cert_url.startsWith("https://s3.amazonaws.com") && cert_url.includes('/echo.api/')) {
      console.log('successfully verified cert url '+cert_url);
    } else {
      console.error('error validating the alexa cert:', er);
      res.status(400).json({ status: 'failure2', reason: er });
      req.session.destroy();
      return false;

    }

    
    if (!req.headers.signature || req.headers.signature == undefined) {
      console.error('missing Signature header:', er);

      res.status(400).json({ status: 'failure5', reason: er });
      req.session.destroy();
      return false;
    }
    
    if (json.session.application.applicationId !== applicationId) {
      console.error('Invalid applicationId: ' + json.session.application.applicationId);
      res.status(400).json({ status: 'failure3', reason: er });
      req.session.destroy();
      return false;
    }

    // console.log(signature)
    // console.log(requestBody)
    // console.log(cert_url)
    // console.log('curl -H "Content-Type: application/json" -H "SignatureCertChainUrl: ' + cert_url + '" -H \'Signature: ' + signature + '\' -X POST -d \'' + requestBody.replace(/(\r\n|\n|\r)/gm,"") + '\'  --verbose https://materialistic-sphere.glitch.me/wikia')

    //verify the request
//     verifier(cert_url, signature, requestBody, function(er) {

//       if (er) {
//         //if it fails, throw an error and return a failure
//         console.error('error validating the alexa cert:', er);
//         res.status(400).json({ status: 'failure4', reason: er });
//         req.session.destroy();
//         return false;

//       } else {
//         //proceed
//         console.log("verified!")
//         // return true;
//       }

//     });
    
    
        
    
    
	}
	// Add a dummy attribute to the response
	,postRequest: function(json,req,res) {
		//console.log("postRequest set");
		//json.dummy = "text";
	}
});

