var request = require("request");
var fs = require("fs");
var mkdrip = require("mkdirp");
var path = require("path");
var getDirName = require("path").dirname
var _ = require('lodash');
import {Utils} from './utils';
var cheerio = require('cheerio');
var S = require('string');


class Spider {

    url: string = '';

    constructor(pageUrl) {

        this.url = pageUrl;

        this.spider(pageUrl, (err, filename) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`Download complete`);
            }
        });
    }
    spider (url, callback) {

        var filename = Utils.prototype.urlToFilename(url);

        var formattedFile;

        fs.readFile(filename, 'utf8', (err, body) => {

            if (err) {

                if (err.code !== 'ENOENT') return callback(err);

                return this.download(url, filename, (err, body) => {

                    if (err) return callback(err);

                    this.getLinks(url, body, callback);
                })
            }

            this.getLinks(url, body, callback);
            /*formattedFile = body.replace(/href="\//ig, 'href="');
            formattedFile = formattedFile.replace(/src="\//ig, 'src="');*/

            /*if(formattedFile !== undefined) {

                fs.writeFile(filename, formattedFile, function(err) {

                    if(err) {
                        return console.log(err);
                    }

                    console.log("The file was saved!");
                });

            }*/
        });


    }
    download (url, filename, callback) {

        request(url, (err, response, body) => {

            if (err) return callback(err);

            this.saveFile(filename, body, (err) => {

                if (err) return callback(err);

                callback(null, body);

            });

        });
    }
    saveFile(filename, contents, callback) {

        var hostFolder = path.dirname(filename);

        mkdrip(hostFolder, (err) => {

            if (err) return callback(err);

            fs.writeFile(filename, contents, (err) => {

                if (err) return callback(err);

                callback(null, filename, true);

            })
        })

    }
    getLinks(url, body, callback){

        var self = this;
        var links = Utils.prototype.getPageLinks(url, body);
        var styleSheets = Utils.prototype.getStyleSheets(url, body);
        var images = Utils.prototype.getImages(url, body);
        var scripts = Utils.prototype.getScripts(url, body);

        _.map(styleSheets, (styleSheet) => {

            var path = 'https://www.' + Utils.prototype.getHostName(this.url) + styleSheet;

            self.downloadAsset(path, (err) => {

                if (err) return callback(err);

                callback(null, body);

            });
        });
        _.map(scripts, (script) => {

            var path = 'https://www.' + Utils.prototype.getHostName(this.url) + script;
            self.downloadAsset(path, (err) => {

                if (err) return callback(err);

                callback(null, body);

            });
        });
        _.map(images, (image) => {

            var path = 'https://www.' + Utils.prototype.getHostName(this.url) + image;
            self.downloadImages(path, (err) => {

                if (err) return callback(err);

                callback(null, body);

            });
        });
        _.map(links, (link) => {

            var formattedFile;
            var filename = Utils.prototype.urlToFilename(link);

            if(link.indexOf('wifi') !== - 1) {

                fs.readFile(filename, 'utf8', (err, body) => {

                    if (err) {

                        if (err.code !== 'ENOENT') return callback(err);

                        return this.download(link, filename, (err, body) => {

                            if (err) return callback(err);

                            this.getLinks(url, body, callback);
                        })
                    }

                    formattedFile = body.replace(/href="\//ig, 'href="');
                    formattedFile = formattedFile.replace(/src="\//ig, 'src="');

                    /*if(formattedFile !== undefined) {

                     fs.writeFile(filename, formattedFile, function(err) {

                     if(err) {
                     return console.log(err);
                     }

                     console.log("The file was saved!");
                     });

                     }*/
                });
            }

        });




    }
    downloadAsset(link, callback) {

        var dirname = Utils.prototype.urlToFilename(link);

        request(link, (err, response, body) => {

            if (err) return callback(err);

            this.saveAsset(link, dirname, body, (err) => {

                if (err) return callback(err);

                callback(null, body);

            })
        })

    }
    downloadImages(link, callback) {

        var dirname = Utils.prototype.urlToFilename(link);

        request.get({url: link, encoding: 'binary'}, (err, response, body) => {

            if (err) return callback(err);

            this.saveImage(link, dirname, body, (err) => {

                if (err) return callback(err);

                callback(null, body);

            })

        })
    }
    saveImage (pathName, dirname, body, callback) {

        var filename = Utils.prototype.fileNameFromUrl(pathName);

        mkdrip(path.dirname(dirname), (err) => {

            if (err) return callback(err);

            var removeDirName = path.dirname(dirname);

            fs.writeFile(path.join(removeDirName, filename), body, 'binary', (err) => {

                if (err) return callback(err);

                callback(null, filename, true);

            });
        });

    }
    saveAsset(pathName, dirname, body, callback) {

        var filename = Utils.prototype.fileNameFromUrl(pathName);

        mkdrip(path.dirname(dirname), (err) => {

            if (err) return callback(err);

            var removeDirName = path.dirname(dirname);

            fs.writeFile(path.join(removeDirName, filename), body, (err) => {

                if (err) return callback(err);

                callback(null, filename, true);

            });
        });
    }
}

new Spider('https://www.arqiva.com/wifi/');



