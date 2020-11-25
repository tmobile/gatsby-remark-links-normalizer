/*
 * =========================================================================
 * Copyright 2020 T-Mobile USA, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 * See the LICENSE file for additional language around the disclaimer of
 * warranties. Trademark Disclaimer: Neither the name of “T-Mobile, USA”
 * nor the names of its contributors may be used to endorse or promote
 * products derived from this software without specific prior written
 * permission.
 * =========================================================================
 */

/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

import { PluginOptions } from "gatsby";
import visit from "unist-util-visit";

interface GatsbyRemarkLinksNormalizerOptions extends PluginOptions {
  indexFileName?: string;
}

export default function (
  args: any,
  { indexFileName = "readme.md" }: GatsbyRemarkLinksNormalizerOptions
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
      console.log("Link changed", {
        from: link.url,
        to: newLinkHref,
      });
      // }
      link.url = newLinkHref;
    }
  });

  return markdownAST;
}
