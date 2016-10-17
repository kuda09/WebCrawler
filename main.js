"use strict";
var request = require("request");
var fs = require("fs");
var mkdrip = require("mkdirp");
var path = require("path");
var getDirName = require("path").dirname;
var _ = require('lodash');
var utils_1 = require('./utils');
var cheerio = require('cheerio');
var S = require('string');
var Spider = (function () {
    function Spider(pageUrl) {
        this.url = '';
        this.url = pageUrl;
        this.spider(pageUrl, function (err, filename) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Download complete");
            }
        });
    }
    Spider.prototype.spider = function (url, callback) {
        var _this = this;
        var filename = utils_1.Utils.prototype.urlToFilename(url);
        var formattedFile;
        fs.readFile(filename, 'utf8', function (err, body) {
            if (err) {
                if (err.code !== 'ENOENT')
                    return callback(err);
                return _this.download(url, filename, function (err, body) {
                    if (err)
                        return callback(err);
                    _this.getLinks(url, body, callback);
                });
            }
            _this.getLinks(url, body, callback);
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
    };
    Spider.prototype.download = function (url, filename, callback) {
        var _this = this;
        request(url, function (err, response, body) {
            if (err)
                return callback(err);
            _this.saveFile(filename, body, function (err) {
                if (err)
                    return callback(err);
                callback(null, body);
            });
        });
    };
    Spider.prototype.saveFile = function (filename, contents, callback) {
        var hostFolder = path.dirname(filename);
        mkdrip(hostFolder, function (err) {
            if (err)
                return callback(err);
            fs.writeFile(filename, contents, function (err) {
                if (err)
                    return callback(err);
                callback(null, filename, true);
            });
        });
    };
    Spider.prototype.getLinks = function (url, body, callback) {
        var _this = this;
        var self = this;
        var links = utils_1.Utils.prototype.getPageLinks(url, body);
        var styleSheets = utils_1.Utils.prototype.getStyleSheets(url, body);
        var images = utils_1.Utils.prototype.getImages(url, body);
        var scripts = utils_1.Utils.prototype.getScripts(url, body);
        _.map(styleSheets, function (styleSheet) {
            var path = 'https://www.' + utils_1.Utils.prototype.getHostName(_this.url) + styleSheet;
            var filename = utils_1.Utils.prototype.urlToFilename(path);
            fs.readFile(filename, 'utf8', function (err, body) {
                if (err) {
                    if (err.code !== 'ENOENT')
                        return callback(err);
                    return _this.download(path, filename, function (err, body) {
                        if (err)
                            return callback(err);
                        self.getStyleSheetImages(url, body, callback);
                    });
                }
                self.downloadAsset(path, function (err) {
                    if (err)
                        return callback(err);
                    callback(null, body);
                    self.getStyleSheetImages(url, body, callback);
                });
            });
        });
        _.map(scripts, function (script) {
            var path = 'https://www.' + utils_1.Utils.prototype.getHostName(_this.url) + script;
            self.downloadAsset(path, function (err) {
                if (err)
                    return callback(err);
                callback(null, body);
            });
        });
        _.map(images, function (image) {
            var path = 'https://www.' + utils_1.Utils.prototype.getHostName(_this.url) + image;
            self.downloadImages(path, function (err) {
                if (err)
                    return callback(err);
                callback(null, body);
            });
        });
        _.map(links, function (link) {
            var filename = utils_1.Utils.prototype.urlToFilename(link);
            if (link.indexOf('wifi') !== -1) {
                fs.readFile(filename, 'utf8', function (err, body) {
                    if (err) {
                        if (err.code !== 'ENOENT')
                            return callback(err);
                        return _this.download(link, filename, function (err, body) {
                            if (err)
                                return callback(err);
                            _this.getLinks(url, body, callback);
                        });
                    }
                });
            }
        });
    };
    Spider.prototype.getStyleSheetImages = function (url, body, callback) {
        var _this = this;
        var self = this;
        var images = utils_1.Utils.prototype.getLinksFromStyleSheets(url, body);
        _.map(images, function (image) {
            var path = 'https://www.' + utils_1.Utils.prototype.getHostName(_this.url) + image;
            self.downloadImages(path, function (err) {
                if (err)
                    return callback(err);
                callback(null, body);
            });
        });
    };
    Spider.prototype.downloadAsset = function (link, callback) {
        var _this = this;
        var dirname = utils_1.Utils.prototype.urlToFilename(link);
        request(link, function (err, response, body) {
            if (err)
                return callback(err);
            _this.saveAsset(link, dirname, body, function (err) {
                if (err)
                    return callback(err);
                callback(null, body);
            });
        });
    };
    Spider.prototype.downloadImages = function (link, callback) {
        var _this = this;
        var dirname = utils_1.Utils.prototype.urlToFilename(link);
        console.log(dirname);
        var cdnIndex = link.indexOf('//ssl');
        if (cdnIndex !== -1) {
            link = "http:" + link.substring(22, link.length);
        }
        request.get({ url: link, encoding: 'binary' }, function (err, response, body) {
            if (err)
                return callback(err);
            _this.saveImage(link, dirname, body, function (err) {
                if (err)
                    return callback(err);
                callback(null, body);
            });
        });
    };
    Spider.prototype.saveImage = function (pathName, dirname, body, callback) {
        var filename = utils_1.Utils.prototype.fileNameFromUrl(pathName);
        mkdrip(path.dirname(dirname), function (err) {
            if (err)
                return callback(err);
            var removeDirName = path.dirname(dirname);
            fs.writeFile(path.join(removeDirName, filename), body, 'binary', function (err) {
                if (err)
                    return callback(err);
                callback(null, filename, true);
            });
        });
    };
    Spider.prototype.saveAsset = function (pathName, dirname, body, callback) {
        var filename = utils_1.Utils.prototype.fileNameFromUrl(pathName);
        mkdrip(path.dirname(dirname), function (err) {
            if (err)
                return callback(err);
            var removeDirName = path.dirname(dirname);
            fs.writeFile(path.join(removeDirName, filename), body, function (err) {
                if (err)
                    return callback(err);
                callback(null, filename, true);
            });
        });
    };
    return Spider;
}());
new Spider('https://www.arqiva.com/wifi');
//# sourceMappingURL=main.js.map