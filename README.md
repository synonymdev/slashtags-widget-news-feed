# slashtags-widget-news-feed

A slashtags widget with recent news.

## Usage

### Feed

Copy `config/config.example.json` to `config/config.json` then edit the relay address.

```bash
cp config/config.example.json config/config.json
```

Start the feed writer

```bash
npm start
```

It will generate a `keyPair` and persist that in `config/config.json` for future sessions.

It should print: `Running Bitcoin news feed: slashfeed:<id>/Bitcoin Headlines?relay=<relay-address>`

### Reader

To read The news feed use the `Reader` helper class.

```js
const { Feed, Reader } = require('slashtags-widget-news-feed')

(async () => {
  const client = new Client({ storage: './path/to/feed/storage', relay: 'https://web-relay.example.com' })
  const feed = new Feed(client, config, { icon })

  await feed.ready() 

  const client = new Client({ storage: './path/to/reader/storage'})

  const readerClient = new Client({ storage: tmpdir() })
  const reader = new Reader(readerClient, feed.url)

  const latestArticle = await reader.getLatestArticle()
  // {
  //   title: 'Article Title',
  //   link: 'https://example.com/article-x',
  //   published: 1692255625871,
  //   publisher: { title: 'Feed Bar', link: 'bar.example.com' }
  // }
})
```
