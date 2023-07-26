# slashtags-widget-news-feed

A slashtags widget with recent news.
Each news headline is stored in the feeds folder in a separate file. Sort the files by creation timestamp to get the headlines in order.

Each file contains the following json...

```
{
    title: "the headline"
    published: <published timestamp>,
    publishedDate: "<published date as text>",
    link: "<link to article>",
    author: "headline author",
    category: [ <list of categories> ],
    thumbnail: "<optional url of a thumbnail image for the article>",
    publisher: "<publisher of the article>"
}
```
