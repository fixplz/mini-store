'use strict';

var L = require('lodash')

module.exports = Tree

function Tree (val) {
  if(val == null
  || typeof val != 'object'
  || (val.constructor != Object && val.constructor != Array && val.constructor != Tree) ) {
    throw new Error('cannot initialize tree with ' + val)
  }

  if(Array.isArray(val)) {
    var obj = [].slice.call(val)
    obj.__proto__ = Tree.prototype
    Object.defineProperty(obj, 'constructor', { value: Tree })
    return obj
  }
  else {
    if(! (this instanceof Tree))
      return new Tree(val)
    return L.assign(this, val)
  }
}

function isTree (val) {
  return val != null
    && typeof val == 'object'
    && val.__proto__ == Tree.prototype
}
Tree.isTree = isTree

Tree.prototype.clone = function clone () {
  if(Array.isArray(this))
    return Tree([].slice.call(this))
  else
    return Tree(L.assign({}, this))
}

Tree.prototype.get = function get (path, maybe) {
  var cursor = this

  for(var ix = 0; ix < path.length; ix ++) {
    if(! isTree(cursor)) {
      if(maybe) return null
      throw new Error('cannot get path [' + path + ']')
    }

    cursor = cursor[path[ix]]
  }

  return cursor
}

Tree.prototype.getMaybe = function getMaybe (path) {
  return this.get(path, true)
}

Tree.prototype.change = function change (path, val) {
  var key = path[0], rest = path.slice(1)

  if(path.length > 1) {
    var subval = this[key]

    if(! isTree(subval))
      subval = Tree({})

    var newval = subval.change(rest, val)

    if(subval == newval)
      return this
  }
  else
    var newval = val

  var copy = Tree(this)
  setProperty(copy, key, newval)
  return copy
}

function setProperty (obj, prop, val) {
  if(val == null)
    delete obj[prop]
  else
    obj[prop] = val
}

Tree.prototype.remove = function remove (path) {
  return this.change(path, null)
}

Tree.prototype.modify = function modify (path, func) {
  return this.change(path, func(this.getMaybe(path)))
}

Tree.prototype.patch = function patch (patch) {
  if(! isTree(patch))
    throw new Error('patch must be tree')

  var copy = Tree(Array.isArray(this) ? [] : {})

  L.assign(copy, this, patch)

  var _this = this
  L.each(copy, function (_, k) {
    setProperty(copy, k,
      isTree(_this[k]) && isTree(patch[k])
      ? _this[k].patch(patch[k])
      : patch[k] == null ? _this[k] : patch[k])
  })

  return copy
}
