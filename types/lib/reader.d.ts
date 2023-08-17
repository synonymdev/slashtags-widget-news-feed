export = NewsFeedReader;
declare class NewsFeedReader extends Reader {
    /**
     * @returns {Promise<Article[] | null>}
     */
    getAllArticles(): Promise<Article[] | null>;
    /**
     * Read the latest price of trading pair.
     *
     * @returns {Promise<Article | null>}
     */
    getLatestArtible(): Promise<Article | null>;
}
declare namespace NewsFeedReader {
    export { Article };
}
import { Reader } from "@synonymdev/feeds";
type Article = import('./writer').Article;
//# sourceMappingURL=reader.d.ts.map