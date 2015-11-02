module.exports = Store

function Store (initial) {
  if(! (this instanceof Store))
    return new Store(initial)

  this.state = initial || {}
  this.subscribers = []
}

Store.prototype.get = function () {
  return this.state
}

Store.prototype.set = function (val) {
  this.state = val
  this.subscribers.forEach(function (func) { func(val) })
}

Store.prototype.modify = function (func) {
  this.set(func(this.get()))
}

Store.prototype.onChange = function (func) {
  this.subscribers.push(func)
}

Store.prototype.offChange = function (func) {
  var ix = this.subscribers.indexOf(func)
  if(ix != -1) this.subscribers.splice(ix, 1)
}
