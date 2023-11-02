const test = require('brittle')
const os = require('os')
const fs = require('fs')
const path = require('path')
const { Client, Relay } = require('@synonymdev/web-relay')

const { Reader, Feed } = require('../index.js')

const icon = fs.readFileSync(path.join(__dirname, '../lib/icon.svg'))
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/slashfeed.json'), 'utf8'))

const FEED_FOO = {
  title: 'Feed Foo',
  link: 'foo.example.com',
  items: [
    {
      title: 'Foo Article 1',
      link: 'foo.example.com/article-1',
      isoDate: new Date(1692255625860)
    },
    {
      title: 'Foo Article 2',
      link: 'foo.example.com/article-2',
      isoDate: new Date(1692255625861)
    }
  ]
}

const FEED_BAR = {
  title: 'Feed Bar',
  link: 'bar.example.com',
  items: [
    {
      title: 'Bar Article 1',
      link: 'bar.example.com/article-1',
      isoDate: new Date(1692255625870)
    },
    {
      title: 'Bar Article 2',
      link: 'bar.example.com/article-2',
      isoDate: new Date(1692255625871)
    }
  ]
}

test('immediate update', async (t) => {
  const relay = new Relay(tmpdir())
  const address = await relay.listen()

  const client = new Client({ storage: tmpdir(), relay: address })
  const feed = new Feed(client, config, { icon, feeds: ['foo.example.com', 'bar.example.com'] })
  mock(feed)

  await feed.ready()

  const readerClient = new Client({ storage: tmpdir() })
  const reader = new Reader(readerClient, feed.url)

  t.alike(await reader.getConfig(), config)
  t.alike(await reader.getIcon(), icon)

  const latestArticle = await reader.getLatestArticle()

  t.alike(latestArticle, {
    title: 'Bar Article 2',
    link: 'bar.example.com/article-2',
    published: 1692255625871,
    publisher: {
      title: 'Feed Bar', link: 'bar.example.com'
    }
  })

  relay.close()
  await feed.close()
})

/**
 * @param {import('../index.js').Feed} feed
 */
function mock (feed) {
  // @ts-ignore
  feed._getFeed = async (url) => {
    switch (url) {
      case 'foo.example.com':
        return FEED_FOO
      case 'bar.example.com':
        return FEED_BAR
    }
  }
}

function tmpdir () {
  return path.join(os.tmpdir(), Math.random().toString(16).slice(2))
}
