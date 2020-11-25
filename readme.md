# gatsby-remark-links-normalizer

This plugin for [gatsby-transformer-remark](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-transformer-remark) ensures links that work in markdown on GitHub, GitLab, BitBucket, etc, will also work in your Gatsby site without modification.

## Example

Before `gatsby-remark-links-normalizer`:

```markdown
[This link to page.md](/page.md) is broken when rendered with gatsby-transformer-remark.

And [this link to page](/page) is broken when rendered in GitHub.
```

After `gatsby-remark-links-normalizer`:

```markdown
[This link to page.md](/page.md) works when rendered with gatsby-transformer-remark AND when rendered in GitHub!
```

## Link Transformations

| Markdown Link To             | Transformation | Description                        |
| ---------------------------- | -------------- | ---------------------------------- |
| `readme.md` or `./readme.md` | `./`           | Treats readme files as the "index" |
| `anything/readme.md`         | `anything/`    | Works with relative URLs           |
| `anything.md`                | `anything/`    | Supports most common slug scheme   |

## Installation and Use

```bash
npm install --save-dev @tmus/gatsby-remark-links-normalizer
```

In your `gatsby-config.js`:

```javascript
module.exports = {
  // ...  other config options
  plugins: [
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: ["@tmus/gatsby-remark-links-normalizer"],
      },
    },
  ],
};
```
