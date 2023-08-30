const { Feed } = require('@synonymdev/feeds')
const RssParser = require('rss-parser')

const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE

const DEFAULT_INTERVAL = HOUR // every 1 minute

class NewsFeed extends Feed {
  /**
   * @param {ConstructorParameters<typeof Feed>[0]} client
   * @param {ConstructorParameters<typeof Feed>[1]} config
   * @param {object} [opts]
   * @param {Uint8Array} [opts.icon]
   * @param {number} [opts.interval]
   * @param {string[]} [opts.feeds] - RSS feeds to poll
   */
  constructor (client, config, opts) {
    super(client, config, opts)

    this._feeds = opts.feeds || []

    // Start on next tick, allowing mocking some methods in unit test after construction.
    setTimeout(() => {
      this.onInterval()
      this._interval = setInterval(this.onInterval.bind(this), opts.interval || DEFAULT_INTERVAL)
    }, 0)
  }

  async onInterval () {
    /** @type {Map<string, Article>} */
    const articlesMap = new Map()

    await Promise.all(this._feeds.map(async (rssUrl) => {
      const feed = await this._getFeed(rssUrl)
      const publisher = { title: feed.title, link: feed.link, image: feed.image?.url }

      try {
        for (const article of feed.items) {
          articlesMap.set(article.title, {
            title: article.title,
            link: article.link,
            published: Number(new Date(article.isoDate)),
            publisher,
            publishedDate: article.pubDate,
            comments: article.comments,
            author: article.creator,
            categories: article.categories,
            thumbnail: article['media:content']?.$?.url
          })
        }
      } catch (error) {
        console.error(`Error processing RSS feed ${rssUrl} - skipping for now`)
        console.error(error)
      }
    }))

    const articles = [...articlesMap.values()]
      .sort((a, b) => a.published - b.published)

    return this.put('headlines', Feed.encode(articles))
  }

  /**
   * @param {string} rssUrl
   */
  _getFeed (rssUrl) {
    const parser = new RssParser()
    return parser.parseURL(rssUrl)
  }

  async close () {
    clearInterval(this._interval)
    return super.close()
  }
}

module.exports = NewsFeed

/**
 * @typedef {{
 *  title: string;
 *  link: string;
 *  published: number,
 *  publishedDate: string,
 *  comments: string,
 *  author: string,
 *  categories: string[],
 *  thumbnail: string,
 *  publisher: {
 *   title: string
 *   link: string
 *  }
 * }} Article
 */
