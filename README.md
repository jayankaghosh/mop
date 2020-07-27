# MoP - Master of puppets
### A puppeteer based cache warmer

Master of puppets is a [puppeteer](https://github.com/puppeteer/puppeteer) based cache warming tool. It takes a `sitemap.xml` as the input, and crawls 
all the URLs in the sitemap. It also support multiple threads, progress bar, verbose output, and many other useful stuff. And since it uses puppeteer, it can even
support warming of Single-Page-Applications!

## Usage

`npm run start -- --sitemap=https://www.my-website.com/sitemap.xml`

### Available options

- `--verbose` - Show a verbose output
- `--sitemap` - The sitemap's absolute URL
- `--threads` - The total number of threads to start. (default: `NUMBER_OF_CPUS`)
- `--timeout` - The timeout between each warm in milliseconds. (default: 1000)
- `--help` - Show this help message
