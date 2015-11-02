var Kefir = require('kefir')

module.exports = watchStore

function watchStore (store) {
  return Kefir.stream(function(emitter) {
      function emit(val) { emitter.emit(val) }
      store.onChange(emit)
      emitter.emit(store.get())
      return function () { store.offChange(emit) }
  }).toProperty()
}
