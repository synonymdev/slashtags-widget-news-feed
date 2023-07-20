import fs from 'fs'
import path from 'path'
import dayjs from 'dayjs'
import rss from 'rss-to-json'
import Feeds from '@synonymdev/feeds'
import { format, encode } from '@synonymdev/slashtags-url'
import logger from './logger.js'

export default class NewsFeed {
    constructor(config, schema) {
        this.config = config
        this.schema = schema
        this.timer = null
        this.feedStorage = null
        this.driveId = config.driveId
        this.refreshInterval = config.refreshInterval
    }

    async init() {
        if (this.feedStorage) {
            throw new Error('Init called twice')
        }

        // Set up the storage for the feeds
        this.feedStorage = new Feeds(this.config.storagePath, this.schema)

        // ensure a drive has been created for our feeds and announce it - gets the keys back
        const driveKeys = await this.feedStorage.feed(this.driveId, { announce: true })

        // Write the logo images into the feed
        const imageData = fs.readFileSync('./schemas/images/news.svg')
        await this.feedStorage.ensureFile(this.driveId, '/images/news.svg', imageData)

        // this is the hyperdrive that will contain all the feed data
        const url = format(driveKeys.key, { protocol: 'slashfeed:', fragment: { encryptionKey: encode(driveKeys.encryptionKey) } })
        logger.info(this.schema.name)
        logger.info(url)
        logger.info(`Refreshing every ${(this.refreshInterval / 1000 / 60).toFixed(0)} minutes`)
    }

    async start() {
        if (!this.feedStorage) {
            throw new Error('Must call init before you can start')
        }

        // update the news and set a timer to do it again from time to time
        await this.updateNews()
    }

    async stop() {
        clearTimeout(this.timer)
    }

    ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////

    async updateNews() {
        for (const rssUrl of this.config.feeds) {
            try {
                logger.info(`Processing ${rssUrl} for new headlines...`)
                const headlines = await rss.parse(rssUrl)

                // Grab all the publisher data from the feed
                const publisher = {
                    title: headlines.title,
                    link: headlines.link,
                    image: headlines.image
                }

                // and ensure all the headlines are up to date
                // Searlise this, so we only update one at a time
                for (const item of headlines.items) {
                    await this.ensureHeadline(item, publisher)
                }
            } catch (err) {
                logger.error(`Error processing RSS feed ${rssUrl} - skipping for now`)
                logger.error(err)
            }
        }

        // do it again in about an hour
        setTimeout(async () => this.updateNews(), this.refreshInterval)
    }

    async ensureHeadline(headline, publisher) {
        // Generate a filename for the headline
        const regex = /[^a-z0-9]+/gi;
        const filename = `${headline.published} ${headline.title}`.toLowerCase().trim().replace(regex, '-')
        const key = path.join(Feeds.FEED_PREFIX, filename)

        // Figure out time ranges to consider resonable
        const now = dayjs()
        const yearAgo = dayjs().subtract(1, 'year')
        const nextMonth = dayjs().add(1, 'month')

        // Used to format the date into a human readable form
        const t = dayjs(+headline.published)
        const displayDate = t.format('ddd D MMM YYYY, h:mma (Z)')

        // See if the article date is way off (mostly to catch bad dates to be honest)
        if (t.isBefore(yearAgo) || t.isAfter(nextMonth)) {
            console.log(`Date of headline outside reasonable timescale: ${displayDate} ${filename}`)
            await this.feedStorage.deleteFile(this.driveId, key)

            return
        }

        // Prepare the content of the file
        const content = {
            title: headline.title,
            published: +headline.published,
            publishedDate: displayDate,
            link: headline.link,
            author: headline.author,
            category: headline.category,
            thumbnail: headline.media?.thumbnail?.url,
            publisher
        }

        // Ensure that the file exists and is up to date
        const data = Buffer.from(JSON.stringify(content))
        const updated = await this.feedStorage.ensureFile(this.driveId, key, data)
        if (updated) {
            logger.info(`  ${displayDate} - ${headline.title}`)
        }
    }
}
