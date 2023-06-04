const makeUrlSafe = function (string) {
  return string.toLowerCase().replace(/[_ ]/g, '-').replace(/[^\d\w-]/g, '')
}
const unidecode = require('unidecode')
const debug = require("debug")("mgatland")

module.exports = function plugin (md, options) {
  md.core.ruler.push('named_headings', namedHeadings.bind(null, md))
}

function namedHeadings (md, state) {
  var ids = {}

  state.tokens.forEach(function (token, i) {
    if (token.type === 'heading_open') {
      var text = md.renderer.render(state.tokens[i + 1].children, md.options)
      //remove tags like <a href='...> and </a>. mgatland had to add this, it wasn't handled by markdown-it-named-headings on npm.
      const plainText = text.replace(/<[^>]+>/g, '')
      //debug("mgatland", plainText)
      var id = makeUrlSafe(unidecode(plainText))
      var uniqId = uncollide(ids, id)
      ids[uniqId] = true
      setAttr(token, 'id', uniqId)
    }
  })
}

function uncollide (ids, id) {
  if (!ids[id]) return id
  var i = 1
  while (ids[id + '-' + i]) { i++ }
  return id + '-' + i
}

function setAttr (token, attr, value, options) {
  var idx = token.attrIndex(attr)

  if (idx === -1) {
    token.attrPush([ attr, value ])
  } else if (options && options.append) {
    token.attrs[idx][1] =
      token.attrs[idx][1] + ' ' + value
  } else {
    token.attrs[idx][1] = value
  }
}
