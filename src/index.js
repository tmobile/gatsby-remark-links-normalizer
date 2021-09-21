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

const visit = import("unist-util-visit");

module.exports = function (args, { indexFileName = "readme.md", log = false }) {
	const isIndex = args.markdownNode.fileAbsolutePath
		.toLowerCase()
		.endsWith(indexFileName);

	const isRelativeLink = (url) =>
		!url.includes("://") && !url.includes("mailto:") && !url.startsWith("#");
	const isRelativeLinkToMdFile = (url) =>
		isRelativeLink(url) && url.endsWith(".md");

	const shouldUpdateLinkPath = isIndex ? isRelativeLinkToMdFile : isRelativeLink;

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
		{ regex: new RegExp(`\.md$`, "gi"), repl: "/" }
	];

	const markdownAST = args.markdownAST;
	// MDAST Syntax Tree Reference: https://github.com/syntax-tree/mdast
	visit(markdownAST, ["link", "image"], (link) => {
		if (shouldUpdateLinkPath(link.url)) {
			let newLinkHref =
				prepend +
				replacers.reduce(
					(prev, curr) => prev.replace(curr.regex, curr.repl),
					link.url
				);

			if (!isIndex) {
				newLinkHref = newLinkHref
					.replace(/\/\.\//, "/") // /./ => /
					.replace(/\.\.\/\//, "../"); // ..// => ../
			}

			log &&
				console.log("Link changed", {
					from: link.url,
					to: newLinkHref
				});

			link.url = newLinkHref;
		}
	});

	return markdownAST;
};
