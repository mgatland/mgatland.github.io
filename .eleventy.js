const markdownIt = require('markdown-it')
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight')
const xmlFiltersPlugin = require('eleventy-xml-plugin')
const markdownItNamedHeadings = require('./markdown-it-named-headings-2.js')
const markdownItAttrs  = require('markdown-it-attrs')
const markdownItAbbr  = require('markdown-it-abbr')
const debug = require('debug')('mgatland')

module.exports = function (eleventyConfig) {

  //run this to debug: 
  //>$env:DEBUG="*mgatland*"; npx @11ty/eleventy --serve
  debug("mgatland", "hi hi")
  const markdownLib = markdownIt({html: true, typographer: true})
    .use(markdownItNamedHeadings)
    .use(markdownItAttrs, {leftDelimiter: '{:'})
    .use(markdownItAbbr)

  //examples: markdownLib.use(markdownItFootnote).use(markdownItAnchor);
  eleventyConfig.setLibrary("md", markdownLib);

  //for 'xml_escape' liquid filter
  eleventyConfig.addPlugin(xmlFiltersPlugin)


  // Enable syntax highlighting
  eleventyConfig.addPlugin(syntaxHighlight);

  // Define a posts collection for all blog posts
  eleventyConfig.addCollection("journal", function(collectionApi) {
    //console.log(collectionApi.getFilteredByGlob("4*.md"))
    return collectionApi.getFilteredByGlob("journal/_posts/*.md");
  });

  eleventyConfig.addCollection("games", function(collectionApi) {
    return collectionApi.getFilteredByGlob("games/*/index.*");
  });

  function sortByOrder(values) {
    // from https://github.com/11ty/eleventy/issues/898
    let vals = values.filter(x => x.data.order !== undefined)
    const sorted = vals.sort((a, b) => Math.sign(a.data.order - b.data.order))
    // debug list all games and their order
    debug("mgatland", sorted.map(x => x.data.order + " " + x.data.title))
    return sorted
  }
eleventyConfig.addFilter("sortByOrder", sortByOrder);

  //Copy everything except .md and eleventy.js files over without modification
  //From all folders except the special hidden folders
  // (i have io.md for the special case where I used a . earlier in the file name, it's a hack, fix this to only use the last '.' in the filename!)
  eleventyConfig.addPassthroughCopy("!(_*|.*|node_modules)/**/*.!(io.md|md|eleventy.js|html|gitignore)")
  //Also files in the root, with some exceptions
  eleventyConfig.addPassthroughCopy("!(_*|.*|package.json|package-lock.json).!(md|eleventy.js|html)")
  // Special case to get files with no extension (i.e. CNAME)
  eleventyConfig.addPassthroughCopy("!(_*|.*|package.json|package-lock.json|*.*)")

  eleventyConfig.addPassthroughCopy("!(_*|.*|node_modules)/**/README.md")

  return {
    dir: {
      layouts: "_layouts"
    }//,
    //FIXME: removing html from here wasn't such a good idea, i DO want html to get preprocessed and just want to set the layout to a blank one
    // I think I just need the site's default template for HTML to be blank...
    // maybe 
    //templateFormats: ["html", "liquid", "njk"]
  }
};