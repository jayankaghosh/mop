const pkg = require('../package');
const CacheWarmer = require('./cache-warmer');
const SiteMapReader = require('./sitemap-reader');
const CommandLineArguments = require('./command-line-arguments');

(async() => {
    try {
        const cpuCores = require('os').cpus().length;
        const commandLineArguments = new CommandLineArguments(pkg.name, pkg.description, [
            { name: 'verbose', alias: 'v', type: Boolean, description: 'Show a verbose output', required: false },
            { name: 'sitemap', alias: 'S', type: String, description: 'The sitemap\'s absolute URL', required: true },
            { name: 'threads', alias: 'T', type: Number, defaultValue: cpuCores, description: `The total number of threads to start. (default: ${cpuCores})`, required: false },
            { name: 'timeout', alias: 't', type: Number, defaultValue: 1000, description: 'The timeout between each warm in milliseconds. (default: 1000)', required: false },
            { name: 'help', type: Boolean, defaultOption: false, description: 'Show this help message', required: false }
        ]);
        const argv = commandLineArguments.getArguments();

        if (!argv.sitemap || argv.help) {
            console.log(usage);
            process.exit();

        }
        const sitemapUrl = argv.sitemap;
        const sitemapReader = new SiteMapReader();
        console.log(`Fetching sitemap data from ${sitemapUrl}...`);
        const urls = await sitemapReader.getFromUrl(sitemapUrl);
        const cacheWarmer = new CacheWarmer(urls, {
            timeout: 30000,
            waitUntil: 'networkidle0'
        }, {
            threads: argv.threads,
            batchInterval: argv.timeout,
            verbose: argv.verbose
        });
        cacheWarmer.warm();
    } catch (e) {
        console.log(e);
    }
})();
