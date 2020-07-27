const fetch = require('node-fetch');
const parseXmlString = require('xml2js').parseString;


class SitemapReader {
    getFromUrl(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const urlList = [];
                const response = await fetch(url).then(r => r.text());
                parseXmlString(response, {trim: true}, (err, result) => {
                    if (!err) {
                        const urlSet = result['urlset'];
                        if (urlSet) {
                            const urls = urlSet['url'].map(url => url.loc[0]);
                            resolve(urls);
                        } else {
                            reject('Invalid sitemap XML');
                        }
                    } else {
                        reject(err);
                    }
                });
            } catch (e) {
                reject(e.message);
            }
        });
    }
}

module.exports = SitemapReader;
