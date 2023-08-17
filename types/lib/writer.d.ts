export = NewsFeed;
declare class NewsFeed extends Feed {
    /**
     * @param {ConstructorParameters<typeof Feed>[0]} client
     * @param {ConstructorParameters<typeof Feed>[1]} config
     * @param {object} [opts]
     * @param {Uint8Array} [opts.icon]
     * @param {number} [opts.interval]
     * @param {string[]} [opts.feeds] - RSS feeds to poll
     */
    constructor(client: [client: import("@synonymdev/web-relay/types/lib/client"), config: Feed.Config, opts?: {
        icon?: Uint8Array;
    }][0], config: [client: import("@synonymdev/web-relay/types/lib/client"), config: Feed.Config, opts?: {
        icon?: Uint8Array;
    }][1], opts?: {
        icon?: Uint8Array;
        interval?: number;
        feeds?: string[];
    });
    _feeds: string[];
    _interval: NodeJS.Timeout;
    onInterval(): Promise<void>;
    /**
     * @param {string} rssUrl
     */
    _getFeed(rssUrl: string): Promise<{
        [key: string]: any;
    } & RssParser.Output<{
        [key: string]: any;
    }>>;
}
declare namespace NewsFeed {
    export { Article };
}
import { Feed } from "@synonymdev/feeds";
import RssParser = require("rss-parser");
type Article = {
    title: string;
    link: string;
    published: number;
    publisher: {
        title: string;
        link: string;
    };
};
//# sourceMappingURL=writer.d.ts.map