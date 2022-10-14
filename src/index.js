import fs from 'fs'
import NewsFeed from './news-feed.js'

// config
const config = JSON.parse(fs.readFileSync('./schemas/config.json', 'utf-8'))
const schema = JSON.parse(fs.readFileSync('./schemas/slashfeed.json', 'utf-8'))

// create the new feed
const feeds = new NewsFeed(config, schema)

// get it started
await feeds.init()
await feeds.start()

