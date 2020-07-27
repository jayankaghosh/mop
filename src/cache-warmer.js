const puppeteer = require('puppeteer');
const PromiseLogger = require('./promise-logger');
const CliProgress = require('cli-progress');

class CacheWarmer {

    constructor(urls, config = {}, options = {}) {
        const defaultOptions = {
            threads: 5,
            batchInterval: 1000,
            verbose: false
        };
        options = Object.assign(defaultOptions, options);

        this.urls = urls;
        this.config = config;
        this.batchSize = Math.ceil(urls.length / options.threads);
        this.batchInterval = options.batchInterval;
        this.options = options;
    }

    warm() {
        const timeStart = new Date().getTime();
        const totalBatches = Math.ceil(this.urls.length / this.batchSize);
        console.log();
        console.log(`TOTAL THREADS: ${totalBatches}`);
        console.log(`TASKS PER THREAD: ${this.batchSize}`);
        console.log(`REST TIME (in ms): ${this.batchInterval}`);
        console.log();
        let i,j, batchNumber = 1;
        const multiProgressBar = new CliProgress.MultiBar({
            clearOnComplete: false,
            hideCursor: true,
            format: `T-{name} [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | {url}`
        }, CliProgress.Presets.shades_grey);
        const threads = [];
        for (i = 0, j = this.urls.length; i < j; i += this.batchSize) {
            const urls = this.urls.slice(i, i + this.batchSize);
            const bar = multiProgressBar.create(urls.length, 0, {
                url: '',
                name: batchNumber
            });
            threads.push(
                this.warmBatch(urls, batchNumber++, bar)
            );
        }
        Promise.all(threads).then(() => {
            multiProgressBar.stop();
            const timeEnd = new Date().getTime();
            console.log();
            console.log(`Warming of ${this.urls.length} URLs completed in ${(timeEnd - timeStart)/1000}s`);
            console.log();
        });
    }

    warmBatch(urls, batchNumber, bar) {
        return new Promise(async resolve => {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            this._warmBatch(page, urls, batchNumber, url => {
                bar.increment(1, { url })
            }, () => {
                browser.close();
                resolve();
            });
        });
    }

    async _warmBatch(browserPage, urls, batchNumber, onProgress, onComplete) {
        if (urls.length) {
            const url = urls.pop();
            try {
                const warmerPromise = this._warmOne(browserPage, url);
                if (this.options.verbose) {
                    const promiseLogger = new PromiseLogger(url);
                    promiseLogger.attach(warmerPromise);
                }
                await warmerPromise;
                setTimeout(() => {
                    if (typeof onProgress === 'function') {
                        onProgress(url);
                    }
                    this._warmBatch(browserPage, urls, batchNumber, onProgress, onComplete);
                }, this.batchInterval);
            } catch (e) {
                console.log(e);
            }
        } else {
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }
    }

    async _warmOne(page, url) {
        await page.goto(url, this.config);
        await page.content();
    }

}

module.exports = CacheWarmer;
