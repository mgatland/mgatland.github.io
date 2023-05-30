const markdownIt = require("markdown-it");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");

module.exports = function (eleventyConfig) {

  const markdownLib = markdownIt({html: true, typographer: true});
  //markdownLib.use(markdownItFootnote).use(markdownItAnchor);
  eleventyConfig.setLibrary("md", markdownLib);

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

  //Copy these files unmodified as assets
  //todo: make this just match everything except 11ty files like .md
  // eleventyConfig.addPassthroughCopy("!(_*)/**/*.js");
  // eleventyConfig.addPassthroughCopy("!(_*)/**/*.swf");
  // eleventyConfig.addPassthroughCopy("!(_*)/**/*.png");
  // eleventyConfig.addPassthroughCopy("!(_*)/**/*.jpg");
  // eleventyConfig.addPassthroughCopy("!(_*)/**/*.css");
  // eleventyConfig.addPassthroughCopy("!(_*)/**/*.html");
  // eleventyConfig.addPassthroughCopy("!(_*)/**/*.tdm");
  // wav, ogg, ...
  eleventyConfig.addPassthroughCopy("!(_*|.*)/**/*.!(md|eleventy.js)")



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