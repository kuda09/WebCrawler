var urlParse = require('url').parse;
var urlFormat = require('url').format;
var urlResolve = require('url').resolve;
var slug = require('slug');
var path = require('path');
var _ = require('lodash');
var cheerio = require('cheerio');

export class Utils {

    constructor() {

    }

    urlToFilename (url) {

        var parsedUrl = urlParse(url);

        var urlPath = parsedUrl.path.split('/')
            .filter(component => component !== '')
            .map(component => slug(component))
            .join('/');


        var filename = path.join(parsedUrl.hostname, urlPath);

        if(!path.extname(filename).match(/htm/)) {

            filename += '.html';
        }

        return filename;
    }
    getLinkUrl (currentUrl, element) {
        var link = urlResolve(currentUrl, element.attribs.href);
        var parsedLink = urlParse(link);
        var currentParsedUrl = urlParse(currentUrl);

        if(parsedLink.hostname !== currentParsedUrl.hostname || !parsedLink.pathname) return null;

        return link;

    }
    getImages(currentUrl, body) {

        return [].slice.call(cheerio.load(body)('img'))
            .map((image) => {
                var imageSrc = image.attribs.src;

                return imageSrc;
            })
    }
    getScripts(currentUrl, body) {

        return [].slice.call(cheerio.load(body)('script[src]'))
            .map((script) => {

                if(script.attribs.src !== "//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"){
                    var scriptSrc = script.attribs.src;
                    return scriptSrc;
                }

            })
    }
    getWifiLinksOnly(links) {

        return _.filter(links, (link) => link.indexOf('wifi') !== -1);
    }
    getStyleSheets(currentUrl, body) {

        return [].slice.call(cheerio.load(body)('link[rel=stylesheet]'))
            .map((style) => {

                var styleSheetRef = style.attribs.href;

                return styleSheetRef;
            })
    }
    getPageLinks (currentUrl, body) {

        return [].slice.call(cheerio.load(body)('a'))
            .map((element) => this.getLinkUrl(currentUrl, element))
            .filter((element) => !!element);
    }
    fileNameFromUrl(url){

        var matches = url.match(/\/([^\/?#]+)[^\/]*$/);
        if (matches.length > 1) {
            return matches[1];
        }
        return null;

    }
    getHostName (url) {

        var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
            return match[2];
        }
        else {
            return null;
        }
    }

}
