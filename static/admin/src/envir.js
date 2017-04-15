define(function (require) {
  const EventModel = require('/pam-event.js')
  const Envir = Object.create(EventModel)
  Object.assign(Envir, {
    page: 1,
  })

  return Envir
})
