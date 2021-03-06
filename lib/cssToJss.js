'use strict'

var cssParse = require('css/lib/parse')

/**
 * Convert css to jss.
 *
 * @param {String} code
 * @return {String}
 * @api public
 */
module.exports = function (options) {
  var ast = cssParse(options.code)

  if (ast.stylesheet && ast.stylesheet.rules) {
    return toJssRules(ast.stylesheet.rules)
  }

  return ''
}

/**
 * Convert rules from css ast to jss style.
 *
 * @param {Array} cssRules
 * @return {Object}
 */
function toJssRules(cssRules) {
  var jssRules = {}

  function addRule(rule, rules) {
    if (rule.type === 'comment') return
    var key, style = {}
    key = rule.selectors.join(', ')
    rule.declarations.forEach(function (decl) {
      style[decl.property] = decl.value
    })
    rules[key] = style
  }

  cssRules.forEach(function (rule) {
    if (rule.type === 'comment') return
    switch (rule.type) {
      case 'rule':
        addRule(rule, jssRules)
        break
      case 'media':
        var key = '@media ' + rule.media
        var value = {}
        rule.rules.forEach(function(rule) {
          addRule(rule, value)
        })
        jssRules[key] = value
        break
      case 'font-face':
        var key = '@' + rule.type
        var value = {}
        rule.declarations.forEach(function (decl) {
          value[decl.property] = decl.value
        })
        jssRules[key] = value
        break
      case 'keyframes':
        var key = '@' + rule.type + ' ' + rule.name
        var value = {}
        rule.keyframes.forEach(function (keyframe) {
          var frameKey = keyframe.values.join(', ')
          var frameValue = {}
          keyframe.declarations.forEach(function (decl) {
            frameValue[decl.property] = decl.value
          })
          value[frameKey] = frameValue
        })
        jssRules[key] = value
    }
  })

  return jssRules
}
