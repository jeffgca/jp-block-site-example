const { Ci, Cu, Cc, Cr } = require('chrome');
Cu.import('resource://gre/modules/Services.jsm');

var patternsToBlock = [new RegExp('.*\:\/\/.*\.dhnet.be\/.*','i'), new RegExp('.*\:\/\/.*\www.dhnet.be\/.*','i')];

var observers;

exports.main = function(options) {
  observers = {
     'http-on-modify-request': {
        observe: function(aSubject, aTopic, aData) {
           //console.info('http-on-modify-request: aSubject = ' + aSubject + ' | aTopic = ' + aTopic + ' | aData = ' + aData);
           var httpChannel = aSubject.QueryInterface(Ci.nsIHttpChannel);
           var requestUrl = httpChannel.URI.spec;

           console.log(requestUrl);
           for (var i = 0; i < patternsToBlock.length; i++) {
              if (patternsToBlock[i].test(requestUrl)) {
                httpChannel.cancel(Cr.NS_BINDING_ABORTED); //or can do redirect instead of cancel like: httpChannel.redirectTo(Services.io.newURI('http://www.google.com', null, null));
                console.log('requestUrl was', requestUrl, 'which matches blocked pattern:', patternsToBlock[i], 'so blocked it');
                break;
              }
           }
           if (requestUrl.indexOf('google.com') > -1) {

           }
        },
        register: function() {
           Services.obs.addObserver(observers['http-on-modify-request'], 'http-on-modify-request', false);
        },
        unregister: function() {
           Services.obs.removeObserver(observers['http-on-modify-request'], 'http-on-modify-request');
        }
     }
  };

  for (var o in observers) {
    observers[o].register();
  }
};

exports.onUnload = function(reason) {
  for (var o in observers) {
    observers[o].unregister();
  }
};
