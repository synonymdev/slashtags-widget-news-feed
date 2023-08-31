const { Feed } = require('./index.js')
const { Client } = require('@synonymdev/web-relay')
const path = require('path')
const fs = require('fs')

const configPath = path.join(__dirname, 'config/config.json')

const { keyPair, storage, relay, refreshInterval, feeds } = readConfig()

const client = new Client({ storage, relay, keyPair })
writeConfig()

const icon = fs.readFileSync(path.join(__dirname, './lib/icon.svg'))
const config = JSON.parse(fs.readFileSync(path.join(__dirname, './lib/slashfeed.json'), 'utf8'))

const feed = new Feed(client, config, { icon, interval: refreshInterval, feeds })
console.log('Running Bitcoin news feed:', feed.url)

function readConfig () {
  let config = {}
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  } catch { }

  try {
    config = {
      storage: config.storage,
      relay: config.relay,
      refreshInterval: config.refreshInterval,
      feeds: config.feeds,
      keyPair: {
        publicKey: Buffer.from(config.publicKey, 'hex'),
        secretKey: Buffer.from(config.secretKey, 'hex')
      }
    }
  } catch { }

  return config
}

function writeConfig () {
  const encoded = JSON.stringify({
    storage,
    relay,
    refreshInterval,
    feeds,
    publicKey: client._keyPair.publicKey.toString('hex'),
    secretKey: client._keyPair.secretKey.toString('hex')
  }, null, 2)

  fs.writeFileSync(configPath, encoded)
}
