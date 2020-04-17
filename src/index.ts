/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

import { PluginOptions } from "gatsby";
import visit from "unist-util-visit";
import { format } from "url";

interface GatsbyRemarkRelativeLinksOptions extends PluginOptions {
  indexFileName?: string;
}

export default function (
  args: any,
  { indexFileName = "readme.md" }: GatsbyRemarkRelativeLinksOptions
) {
  const isIndex = args.markdownNode.fileAbsolutePath
    .toLowerCase()
    .endsWith(indexFileName);

  const isRelativeLink = (url: string) =>
    !url.includes("://") && !url.includes("mailto:") && !url.startsWith("#");
  const isRelativeLinkToMdFile = (url: string) =>
    isRelativeLink(url) && url.endsWith(".md");

  const shouldUpdateLinkPath = isIndex
    ? isRelativeLinkToMdFile
    : isRelativeLink;

  const prepend = isIndex ? "" : "../"; // Pretty URLs add an extra "step". E.g. /my/page.md => /my/page/

  const esc = indexFileName.replace(".", "\\.");
  const replacers = [
    // readme.md => ./
    { regex: new RegExp(`^` + esc + "$", "i"), repl: "./" },
    // ./readme.md => ./
    { regex: new RegExp(`^\.\/` + esc + "$", "i"), repl: "./" },
    // anything/readme.md => anything/
    { regex: new RegExp(`\/` + esc + "$", "i"), repl: "/" },
    // anything.md => anything/
    { regex: new RegExp(`\.md$`, "gi"), repl: "/" },
  ];

  const markdownAST = args.markdownAST;
  // MDAST Syntax Tree Reference: https://github.com/syntax-tree/mdast
  visit(markdownAST as any, ["link", "image"], (link) => {
    if (shouldUpdateLinkPath(link.url as string)) {
      let newLinkHref =
        prepend +
        replacers.reduce(
          (prev, curr) => prev.replace(curr.regex, curr.repl),
          link.url as string
        );
      if (!isIndex) {
        newLinkHref = newLinkHref
          .replace(/\/\.\//, "/") // /./ => /
          .replace(/\.\.\/\//, "../"); // ..// => ../
      }
      // if ((link.url as string).includes("berlin")) {
      console.log("********** Link change", {
        from: link.url,
        to: newLinkHref,
      });
      // }
      link.url = newLinkHref;
    }
  });

  return markdownAST;
}
