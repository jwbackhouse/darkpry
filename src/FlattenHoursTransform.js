
const { Transform } = require('stream')
const dot = require('dot-object')

class FlattenHoursTransform extends Transform {
  constructor () {
    super({
      objectMode: true,
      writableObjectMode: true
    })
  }

  _transform (chunk, encoding, cb) {
    const flattened = flattenHours(chunk)
    flattened.map((row) => {
      this.push(row)
    })
    cb()
  }

  _flush (cb) {
    cb()
  }
}

const flattenHours = (darkSkyCoordinateJsonAsObject) => {
  const flattened = []
  darkSkyCoordinateJsonAsObject.daily.data.map((day) => {
    flattened.push(dot.dot({
      latitude: darkSkyCoordinateJsonAsObject.latitude,
      longitude: darkSkyCoordinateJsonAsObject.longitude,
      day: day
    }))
  })
  return flattened
}

module.exports = FlattenHoursTransform
