const markdownIt = require("markdown-it");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const xmlFiltersPlugin = require('eleventy-xml-plugin')

module.exports = function (eleventyConfig) {

  const markdownLib = markdownIt({html: true, typographer: true});
  //markdownLib.use(markdownItFootnote).use(markdownItAnchor);
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
    return collectionApi.getFilteredByGlob("games/*/*.md");
  });

  //Copy everything except .md and eleventy.js files over without modification
  //From all folders except the special hidden folders
  eleventyConfig.addPassthroughCopy("!(_*|.*|node_modules)/**/*.!(md|eleventy.js|html)")
  //Also files in the root, with some exceptions
  eleventyConfig.addPassthroughCopy("!(_*|.*|diff-2023-05-29.diff|package.json|package-lock.json).!(md|eleventy.js|html)")
  // Special case to get files with no extension (i.e. CNAME)
  eleventyConfig.addPassthroughCopy("!(_*|.*|diff-2023-05-29.diff|package.json|package-lock.json|*.*)")
  
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