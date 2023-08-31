const { Reader } = require('@synonymdev/feeds')

class NewsFeedReader extends Reader {
  /**
   * @returns {Promise<Article[] | null>}
   */
  getAllArticles () {
    return this.getField('headlines')
  }

  /**
   * Read the latest price of trading pair.
   *
   * @returns {Promise<Article | null>}
   */
  async getLatestArtible () {
    const articles = await this.getAllArticles()
    return articles?.[articles.length - 1]
  }

  // /*
  //  * @param {Pair} pair
  //  * @param {(price: number) => void} callback
  //  */
  // subscribeLatestPrice(pair, callback) {
  //   return this.subscribe(pair + '-last', callback)
  // }
}
module.exports = NewsFeedReader

/**
 * @typedef {import('./writer').Article} Article
 */
