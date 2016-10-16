var request = require("request");
var fs = require("fs");
var mkdrip = require("mkdirp");
var path = require("path");
import { Utils } from 'utils';

(function () {
    var sitePage = null;
    var phInstance = null;
    var pageUrl = 'https://www.arqiva.com/wifi/';
    var pageContent = null;

    var spider = function (url, nesting, callback) {

        var filename  = Utils.urlToFilename(url);


        fs.readFile(filename, 'utf8', (err, body) => {

            if(err) {

                if(err.code !== 'ENOENT') return callback(err);

                return download(url, filename, (err, body) => {

                        if(err) return callback(err);

            })
            }

            spiderLinks(url, body, nesting, callback);
    });
    }


    var download = function (url, filename, callback) {

        console.log("Downloading '" + url + "'");

        request(url, (err, response, body) => {


            if(err) return callback(err);

        saveFile(filename, body, (err) => {

            if(err) return callback(err);

        callback(null, body);

    })

    })

    }

    var saveFile = function (filename, contents, callback) {

        mkdrip(path.dirname, (err) => {

            if(err) return callback(err);

        fs.writeFile(filename, contents, (err) => {

            if(err) return callback(err);

        callback(null, filename, true);

    })
    })

    }

    var spiderLinks = function (currentUrl, body, nesting, callback) {

        if(nesting === 0) return process.nextTick(callback);

        var links = Utils.getPageLinks(currentUrl,  body);

        if(links.length === 0) return process.nextTick(callback);

        var completed = 0;
        var errored = false;

        function done (err) {

            if(err) {

                errored = true;
                return callback(err);
            }

            if(++completed === links.length && !errored) {

                return callback();
            }
        }


        links.forEach(function(link){

            spider(link, nesting - 1 , done);
        })

    }


    spider(pageUrl, 6, (err, filename) => {

        if(err) {
            console.log(err);
        } else {
            console.log('Download complete');
}
});



})();