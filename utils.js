"use strict";
var urlParse = require('url').parse;
var urlFormat = require('url').format;
var urlResolve = require('url').resolve;
var slug = require('slug');
var path = require('path');
var _ = require('lodash');
var cheerio = require('cheerio');
var Utils = (function () {
    function Utils() {
    }
    Utils.prototype.urlToFilename = function (url) {
        var parsedUrl = urlParse(url);
        var urlPath = parsedUrl.path.split('/')
            .filter(function (component) { return component !== ''; })
            .map(function (component) { return slug(component); })
            .join('/');
        var filename = path.join(parsedUrl.hostname, urlPath);
        if (!path.extname(filename).match(/htm/)) {
            filename += '.html';
        }
        return filename;
    };
    Utils.prototype.getLinkUrl = function (currentUrl, element) {
        var link = urlResolve(currentUrl, element.attribs.href);
        var parsedLink = urlParse(link);
        var currentParsedUrl = urlParse(currentUrl);
        if (parsedLink.hostname !== currentParsedUrl.hostname || !parsedLink.pathname)
            return null;
        return link;
    };
    Utils.prototype.getImages = function (currentUrl, body) {
        return [].slice.call(cheerio.load(body)('img'))
            .map(function (image) {
            var imageSrc = image.attribs.src;
            return imageSrc;
        });
    };
    Utils.prototype.getScripts = function (currentUrl, body) {
        return [].slice.call(cheerio.load(body)('script[src]'))
            .map(function (script) {
            if (script.attribs.src !== "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js") {
                var scriptSrc = script.attribs.src;
                return scriptSrc;
            }
        });
    };
    Utils.prototype.getWifiLinksOnly = function (links) {
        return _.filter(links, function (link) { return link.indexOf('wifi') !== -1; });
    };
    Utils.prototype.getStyleSheets = function (currentUrl, body) {
        return [].slice.call(cheerio.load(body)('link[rel=stylesheet]'))
            .map(function (style) {
            var styleSheetRef = style.attribs.href;
            return styleSheetRef;
        });
    };
    Utils.prototype.getPageLinks = function (currentUrl, body) {
        var _this = this;
        return [].slice.call(cheerio.load(body)('a'))
            .map(function (element) { return _this.getLinkUrl(currentUrl, element); })
            .filter(function (element) { return !!element; });
    };
    Utils.prototype.fileNameFromUrl = function (url) {
        var matches = url.match(/\/([^\/?#]+)[^\/]*$/);
        if (matches.length > 1) {
            return matches[1];
        }
        return null;
    };
    Utils.prototype.getHostName = function (url) {
        var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
            return match[2];
        }
        else {
            return null;
        }
    };
    return Utils;
}());
exports.Utils = Utils;
//# sourceMappingURL=utils.js.map