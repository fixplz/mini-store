var Store = require('./store')

module.exports = TreeStore

function TreeStore (store, key) {
 if(! (this instanceof TreeStore))
    new TreeStore(store, key)

  this.store = store != null ? store : new Store()
  this.key = key != null ? key : []
}

TreeStore.prototype.at = function at (/*...*/) {
  if(arguments.length == 1 && Array.isArray(arguments[0]))
    var subkey = arguments[0]
  else
    var subkey = Array.prototype.slice.call(arguments)
  return new TreeStore(this.store, this.key.concat(subkey))
}

TreeStore.prototype.get = function get () {
  return this.store.get().get(this.key)
}

TreeStore.prototype.getMaybe = function getMaybe () {
  return this.store.get().getMaybe(this.key)
}

TreeStore.prototype.set = function set (val) {
  var key = this.key
  return this.store.modify(function (state) {
    return state.change(key, val) })
}

TreeStore.prototype.modify = function modify (func) {
  var key = this.key
  return this.store.modify(function (state) {
    return state.modify(key, func) })
}

TreeStore.prototype.patch = function patch (change) {
  var key = this.key
  return this.store.modify(function (state) {
    return state.modify(key, function (subtree) {
      return subtree.patch(change) }) })
}

TreeStore.prototype.onChange = function (func) {
  var _this = this
  var last = this.getMaybe()
  function subscribe (state) {
    var cur = _this.getMaybe()
    if(cur != last) {
      func(cur)
      last = cur
    }
  }
  func._subscribe = subscribe
  this.store.onChange(subscribe)
}

TreeStore.prototype.offChange = function (func) {
  if(func._subscribe != null)
    this.store.offChange(func._subscribe)
}
