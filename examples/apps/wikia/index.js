'use strict';
var _ = require('lodash');
var Alexa = require('alexa-app');
var app = new Alexa.app('wikia');
var WikiaHelper = require('../../../node_modules/alexa-wikia-app-server/wikia_helper');
var reservedWords = ['song','album','film', 'movie']

// var firebase = require('firebase');
// var config = {
//   apiKey: process.env.apiKey,
//   authDomain: process.env.authDomain,
//   databaseURL: process.env.databaseURL,
//   storageBucket: process.env.storageBucket,
//   messagingSenderId: process.env.messagingSenderId
// };
// firebase.initializeApp(config);

//Which Wikia are you using????
var sWikiaName = 'beachboys';

//What Name are you are going to use for the Skill in the Skill store
var sSkillName = "Beach Boys Facts";

// What wikia Catergories to use to build the word lists for the speech model
var oListWikiaCatergories = {
  "LIST_OF_WHO"   : "People",
  "LIST_OF_WHAT"  : "The_Beatles_albums,The_Beatles_songs,People,Films",
  "LIST_OF_SONGS"  : "Songs",
  "LIST_OF_ALBUMS"  : "Albums",
  "LIST_OF_MOVIES"  : "Films",
};

// What Alexa will say in certain situations
var Phrases = {
  "Launch"    :'Ask me about the Beatles.',
  "Help"      :'I can answer questions about The Beatles. Ask "who was" to inquire about a person. For example, "Who was Ringo Starr?". Ask "what is", "tell me", or "describe" to find out about albums, songs, or movies. Add "the song" or "the album" or "the movie" to your question to be more specific. Go ahead and ask a question. For example, "Tell me about the album A Hard Day\'s Night".',
  "Stop"      :'And in the end <break time="0.5s"/> the love you take <break time="0.5s"/> is equal to the love <break time="0.5s"/> you make!<break time="0.5s"/>Goodbye',
  "Error"     :"I couldn\'t find that. How about you try something else.",
  "NotHeard"  :'What is it?  I suggest you try it again.',
  "NotFound"  :'I couldn\'t find that. How about you try something else.',
  "NotFoundSong"  :'I couldn\'t find that song. Let\'s try something else.',
  "NotFoundAlbum"  :'I couldn\'t find that album. Can you try something else?',
  "NotFoundPerson"  :'I couldn\'t find that person. How about you try something else.',
  "NotFoundMovie"  :'I couldn\'t find that movie. Maybe you can try something else.',
  "Reprompt"  :'Lets give it another go.',
  "TakingTooLong":'Are you still there?'
};


var sLicence = 'This article is licensed under the Creative Commons Attribution-ShareAlike 3.0 Unported license. It uses material from the http://'+sWikiaName+'.wikia.com/wiki/'

app.getHelper = function(){
  return new WikiaHelper(sWikiaName, oListWikiaCatergories);
};

app.messages.GENERIC_ERROR = Phrases.Error;
app.error = function(exception, request, response) {
  response.say(Phrases.Error);
};

app.launch(function(req, res) {
  res.say(Phrases.Launch).reprompt(Phrases.TakingTooLong).shouldEndSession(false).send();
});

app.intent("AMAZON.HelpIntent",
  function(req, res) {
    res.say(Phrases.Help).reprompt(Phrases.TakingTooLong).shouldEndSession(false).send();
  }
);

app.intent("AMAZON.StopIntent",
  function(req, res) {
    res.say(Phrases.Stop);
});

app.intent("AMAZON.CancelIntent",
  function(req, res) {
    res.say(Phrases.Stop);
});

app.fetchArticle =   function(sSlot, req, res) {
  var sSubject = "";
  try {
    sSubject = req.slot(sSlot)
  } catch(err) {
    console.log("err", err);
    res.say(Phrases.NotFound).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  }
   
  if (_.isEmpty(sSubject)) {
    res.say(Phrases.NotFound).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  } 
  
  console.log(sSlot, sSubject);
  var oWikiaHelper = this.getHelper();
  
  oWikiaHelper.getLucky(sSubject).then(function(iID) {
    if(iID !== false){
      console.log("iID", iID);
      // console.log(oWikiaHelper.getArticle(iID));

      oWikiaHelper.getArticle(iID).then(function(aData) {
        if(aData.length > 0 ){
           console.log("aData", aData);

          var sTitle = sSubject;
          //https://www.npmjs.com/package/alexa-app#card-examples
          if (aData[0].includes('refer to') || aData[0].includes('could be')) {
            res.card({
              "type": "Simple",
              "title": sSkillName + " - "+sTitle,
              "content": sTitle+" could refer to a song, an album, or a movie. Please ask a more specific question. For example, Describe the song "+sTitle
            }).say(sTitle+" could refer to a song, an album, or a movie. Please ask a more specific question. For example, Describe the song "+sTitle).send();
          } else {
            res.card({
              "type": "Simple",
              "title": sSkillName + " - "+sTitle,
              "content": aData.join("\n")+'\n'+sLicence+sTitle
            }).say(aData.join(" ")).send();
          }
          // firebase.database().ref('/items').push({
          //   title: sTitle,
          //   content: aData.join(" ")
          // });

          return aData.join(" ");
        } else {
          res.say(Phrases.NotFound).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        }
      }).catch(function(err) {
        console.log("err", err);
        if(err.exception.type == "NotFoundApiException"){
          res.say(Phrases.NotFound).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        } else {
          res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        }
      });
    }
  }).catch(function(err) {
    console.log("err",err.statusCode);
    res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
  });
  return false;
};


// app.fetchArticleSong =   function(sSlot, req, res) {
//   var sSubject = "";
//   try {
//     sSubject = req.slot(sSlot)
//   } catch(err) {
//     console.log("err", err);
//     res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false);
//     return true;
//   }
   
//   if (_.isEmpty(sSubject)) {
//     console.log("empty subject"+sSlot);
//     res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false);
//     return true;
//   } 
//   if (reservedWords.includes(sSubject)) {
//     res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false);
//     return true;
//   }   
//   console.log(sSlot, sSubject);
//   var oWikiaHelper = this.getHelper();
  
//   oWikiaHelper.getLucky(sSubject).then(function(iID) {
//     if(iID !== false){
//       console.log("iID", iID);
//       oWikiaHelper.getArticle(iID).then(function(aData) {
//         if(aData.length > 0 ){
//           var sTitle = sSubject;
//           //https://www.npmjs.com/package/alexa-app#card-examples
//           res.card({
//             "type": "Simple",
//             "title": sSkillName + " - "+sTitle,
//             "content": aData.join("\n")+'\n'+sLicence+sTitle
//           }).say(aData.join(" ")).send();
          
//           // firebase.database().ref('/items').push({
//           //   title: sTitle,
//           //   content: aData.join(" ")
//           // });

//           return aData.join(" ");
//         } else {
//           res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//         }
//       }).catch(function(err) {
//         console.log("err", err);
//         if(err.exception.type == "NotFoundApiException"){
//           res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//         } else {
//           res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//         }
//       });
//     }
//   }).catch(function(err) {
//     console.log("err",err.statusCode);
//     res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//   });
//   return false;
// };


app.fetchArticleSong =   function(sSlot, req, res) {
  var sSubject = "";
  try {
    sSubject = req.slot(sSlot)
  } catch(err) {
    console.log("err", err);
    res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  }
   
  if (_.isEmpty(sSubject)) {
    console.log("empty subject"+sSlot);
    res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  } 
  if (reservedWords.includes(sSubject)) {
    res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  }   
  console.log(sSlot, sSubject);
  var oWikiaHelper = this.getHelper();
  
  oWikiaHelper.getLucky(sSubject).then(function(iID) {
    if(iID !== false){
      console.log("iID", iID);
      oWikiaHelper.getArticle(iID).then(function(aData) {
        if(aData.length > 0 ){
          var sTitle = sSubject;
          if (aData[0].includes('refer to') || aData[0].includes('could be')) {
              oWikiaHelper.getLucky(sSubject+" (song)").then(function(iID) {
                if(iID !== false){
                  console.log("iID", iID);
                  oWikiaHelper.getArticle(iID).then(function(aData) {
                    if(aData.length > 0 ){
                      var sTitle = sSubject;
                      res.card({
                        "type": "Simple",
                        "title": sSkillName + " - "+sTitle,
                        "content": aData.join("\n")+'\n'+sLicence+sTitle
                      }).say(aData.join(" ")).send();
                      return aData.join(" ");
                    } else {
                      res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
                    }
                  }).catch(function(err) {
                    console.log("err", err);
                    if(err.exception.type == "NotFoundApiException"){
                      res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
                    } else {
                      res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
                    }
                  });
                }
              }).catch(function(err) {
                console.log("err",err.statusCode);
                res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
              });
          } else {
            res.card({
              "type": "Simple",
              "title": sSkillName + " - "+sTitle,
              "content": aData.join("\n")+'\n'+sLicence+sTitle
            }).say(aData.join(" ")).send();
          }
          return aData.join(" ");
        } else {
          res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        }
      }).catch(function(err) {
        console.log("err", err);
        if(err.exception.type == "NotFoundApiException"){
          res.say(Phrases.NotFoundSong).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        } else {
          res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        }
      });
    }
  }).catch(function(err) {
    console.log("err",err.statusCode);
    res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
  });
  return false;
};



//
//
//
//



// app.fetchArticleAlbum =   function(sSlot, req, res) {
//   var sSubject = "";
//   try {
//     sSubject = req.slot(sSlot)
//   } catch(err) {
//     console.log("err", err);
//     res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false);
//     return true;
//   }
   
//   if (_.isEmpty(sSubject)) {
//     res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false);
//     return true;
//   } 
//   if (reservedWords.includes(sSubject)) {
//     res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false);
//     return true;
//   }   
//   console.log(sSlot, sSubject);
//   var oWikiaHelper = this.getHelper();
  
//   oWikiaHelper.getLucky(sSubject+' (album)').then(function(iID) {
//     if(iID !== false){
//       console.log("iID", iID);
//       oWikiaHelper.getArticle(iID).then(function(aData) {
//         if(aData.length > 0 ){
//           var sTitle = sSubject;
//           //https://www.npmjs.com/package/alexa-app#card-examples
//           res.card({
//             "type": "Simple",
//             "title": sSkillName + " - "+sTitle,
//             "content": aData.join("\n")+'\n'+sLicence+sTitle
//           }).say(aData.join(" ")).send();
          
//           // firebase.database().ref('/items').push({
//           //   title: sTitle,
//           //   content: aData.join(" ")
//           // });

//           return aData.join(" ");
//         } else {
//           res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//         }
//       }).catch(function(err) {
//         console.log("err", err);
//         if(err.exception.type == "NotFoundApiException"){
//           res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//         } else {
//           res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//         }
//       });
//     }
//   }).catch(function(err) {
//     console.log("err",err.statusCode);
//     res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//   });
//   return false;
// };

app.fetchArticleAlbum =   function(sSlot, req, res) {
  var sSubject = "";
  try {
    sSubject = req.slot(sSlot)
  } catch(err) {
    console.log("err", err);
    res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  }
   
  if (_.isEmpty(sSubject)) {
    console.log("empty subject"+sSlot);
    res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  } 
  if (reservedWords.includes(sSubject)) {
    res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  }   
  console.log(sSlot, sSubject);
  var oWikiaHelper = this.getHelper();
  
  oWikiaHelper.getLucky(sSubject).then(function(iID) {
    if(iID !== false){
      console.log("iID", iID);
      oWikiaHelper.getArticle(iID).then(function(aData) {
        if(aData.length > 0 ){
          var sTitle = sSubject;
          if (aData[0].includes('refer to') || aData[0].includes('could be')) {
              oWikiaHelper.getLucky(sSubject+" (album)").then(function(iID) {
                if(iID !== false){
                  console.log("iID", iID);
                  oWikiaHelper.getArticle(iID).then(function(aData) {
                    if(aData.length > 0 ){
                      var sTitle = sSubject;
                      res.card({
                        "type": "Simple",
                        "title": sSkillName + " - "+sTitle,
                        "content": aData.join("\n")+'\n'+sLicence+sTitle
                      }).say(aData.join(" ")).send();
                      return aData.join(" ");
                    } else {
                      res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
                    }
                  }).catch(function(err) {
                    console.log("err", err);
                    if(err.exception.type == "NotFoundApiException"){
                      res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
                    } else {
                      res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
                    }
                  });
                }
              }).catch(function(err) {
                console.log("err",err.statusCode);
                res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
              });
          } else {
            res.card({
              "type": "Simple",
              "title": sSkillName + " - "+sTitle,
              "content": aData.join("\n")+'\n'+sLicence+sTitle
            }).say(aData.join(" ")).send();
          }
          return aData.join(" ");
        } else {
          res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        }
      }).catch(function(err) {
        console.log("err", err);
        if(err.exception.type == "NotFoundApiException"){
          res.say(Phrases.NotFoundAlbum).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        } else {
          res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        }
      });
    }
  }).catch(function(err) {
    console.log("err",err.statusCode);
    res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
  });
  return false;
};


app.fetchArticlePerson =   function(sSlot, req, res) {
  var sSubject = "";
  try {
    sSubject = req.slot(sSlot)
  } catch(err) {
    console.log("err", err);
    res.say(Phrases.NotFoundPerson).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  }
   
  if (_.isEmpty(sSubject)) {
    res.say(Phrases.NotFoundPerson).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  } 

  
  
  console.log(sSlot, sSubject);
  var oWikiaHelper = this.getHelper();
  
  oWikiaHelper.getLucky(sSubject).then(function(iID) {
    if(iID !== false){
      console.log("iID", iID);
      oWikiaHelper.getArticle(iID).then(function(aData) {
        if(aData.length > 0 ){
          var sTitle = sSubject;
          //https://www.npmjs.com/package/alexa-app#card-examples
          res.card({
            "type": "Simple",
            "title": sSkillName + " - "+sTitle,
            "content": aData.join("\n")+'\n'+sLicence+sTitle
          }).say(aData.join(" ")).send();
          
          // firebase.database().ref('/items').push({
          //   title: sTitle,
          //   content: aData.join(" ")
          // });

          return aData.join(" ");
        } else {
          res.say(Phrases.NotFoundPerson).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        }
      }).catch(function(err) {
        console.log("err", err);
        if(err.exception.type == "NotFoundApiException"){
          res.say(Phrases.NotFoundPerson).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        } else {
          res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        }
      });
    }
  }).catch(function(err) {
    console.log("err",err.statusCode);
    res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
  });
  return false;
};

// app.fetchArticleMovie =   function(sSlot, req, res) {
//   var sSubject = "";
//   try {
//     sSubject = req.slot(sSlot)
//   } catch(err) {
//     console.log("err", err);
//     res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false);
//     return true;
//   }
   
//   if (_.isEmpty(sSubject)) {
//     res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false);
//     return true;
//   } 
//   if (reservedWords.includes(sSubject)) {
//     res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false);
//     return true;
//   } 
  
  
//   console.log(sSlot, sSubject);
//   var oWikiaHelper = this.getHelper();
  
//   oWikiaHelper.getLucky(sSubject+' (film)').then(function(iID) {
//     if(iID !== false){
//       console.log("iID", iID);
//       oWikiaHelper.getArticle(iID).then(function(aData) {
//         if(aData.length > 0 ){
//           var sTitle = sSubject;
//           //https://www.npmjs.com/package/alexa-app#card-examples
//           res.card({
//             "type": "Simple",
//             "title": sSkillName + " - "+sTitle,
//             "content": aData.join("\n")+'\n'+sLicence+sTitle
//           }).say(aData.join(" ")).send();
          
//           // firebase.database().ref('/items').push({
//           //   title: sTitle,
//           //   content: aData.join(" ")
//           // });

//           return aData.join(" ");
//         } else {
//           res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//         }
//       }).catch(function(err) {
//         console.log("err", err);
//         if(err.exception.type == "NotFoundApiException"){
//           res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//         } else {
//           res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//         }
//       });
//     }
//   }).catch(function(err) {
//     console.log("err",err.statusCode);
//     res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
//   });
//   return false;
// };

app.fetchArticleMovie =   function(sSlot, req, res) {
  var sSubject = "";
  try {
    sSubject = req.slot(sSlot)
  } catch(err) {
    console.log("err", err);
    res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  }
   
  if (_.isEmpty(sSubject)) {
    console.log("empty subject"+sSlot);
    res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  } 
  if (reservedWords.includes(sSubject)) {
    res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false);
    return true;
  }   
  console.log(sSlot, sSubject);
  var oWikiaHelper = this.getHelper();
  
  oWikiaHelper.getLucky(sSubject).then(function(iID) {
    if(iID !== false){
      console.log("iID", iID);
      oWikiaHelper.getArticle(iID).then(function(aData) {
        if(aData.length > 0 ){
          var sTitle = sSubject;
          if (aData[0].includes('refer to') || aData[0].includes('could be')) {
              oWikiaHelper.getLucky(sSubject+" (film)").then(function(iID) {
                if(iID !== false){
                  console.log("iID", iID);
                  oWikiaHelper.getArticle(iID).then(function(aData) {
                    if(aData.length > 0 ){
                      var sTitle = sSubject;
                      res.card({
                        "type": "Simple",
                        "title": sSkillName + " - "+sTitle,
                        "content": aData.join("\n")+'\n'+sLicence+sTitle
                      }).say(aData.join(" ")).send();
                      return aData.join(" ");
                    } else {
                      res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
                    }
                  }).catch(function(err) {
                    console.log("err", err);
                    if(err.exception.type == "NotFoundApiException"){
                      res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
                    } else {
                      res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
                    }
                  });
                }
              }).catch(function(err) {
                console.log("err",err.statusCode);
                res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
              });
          } else {
            res.card({
              "type": "Simple",
              "title": sSkillName + " - "+sTitle,
              "content": aData.join("\n")+'\n'+sLicence+sTitle
            }).say(aData.join(" ")).send();
          }
          return aData.join(" ");
        } else {
          res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        }
      }).catch(function(err) {
        console.log("err", err);
        if(err.exception.type == "NotFoundApiException"){
          res.say(Phrases.NotFoundMovie).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        } else {
          res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
        }
      });
    }
  }).catch(function(err) {
    console.log("err",err.statusCode);
    res.say(Phrases.Error).reprompt(Phrases.Reprompt).shouldEndSession(false).send();
  });
  return false;
};

app.intent('wikia_who', 
  {
    'slots': {
      'WHO': 'LIST_OF_WHO'
    },
    'utterances': ['{who was|who is} {-|WHO}']
  },
  function(req, res) {
    console.log("wikia who");
    return app.fetchArticlePerson("WHO", req, res);
  }
);

    
app.intent('wikia_song', 
  {
    'slots': {
      'SONG': 'LIST_OF_SONGS'
    },
    'utterances': ['{what was|what is|tell me|tell me about|describe} {|a|the} {song} {-|SONG}']
  },
  function(req, res) {
    console.log("wikia song");
    return app.fetchArticleSong("SONG", req, res);
  }
);

app.intent('wikia_movie', 
  {
    'slots': {
      'MOVIE': 'LIST_OF_MOVIES'
    },
    'utterances': ['{what was|what is|tell me|tell me about|describe} {|a|the} {movie|film} {-|MOVIE}']
  },
  function(req, res) {
    console.log("wikia movie");
    return app.fetchArticleMovie("MOVIE", req, res);
  }
);


app.intent('wikia_album', 
  {
    'slots': {
      'ALBUM': 'LIST_OF_ALBUMS'
    },
    'utterances': ['{what was|what is|tell me|tell me about|describe} {|a|the} {album} {-|ALBUM}']
  },
  function(req, res) {
    console.log("wikia album");
    return app.fetchArticleAlbum("ALBUM", req, res);
  }
);

app.intent('wikia_what', 
  {
    'slots': {
      'WHAT': 'LIST_OF_WHAT'
    },
    'utterances': ['{what was|what is|tell me|tell me about|describe} {|a|the} {-|WHAT}']
  },
  function(req, res) {
    console.log("wikia what");
    return app.fetchArticle("WHAT", req, res);
  }
);


module.exports = app;