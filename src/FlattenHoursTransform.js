
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
  darkSkyCoordinateJsonAsObject.hourly.data.map((hour) => {
    flattened.push(dot.dot({
      latitude: darkSkyCoordinateJsonAsObject.latitude,
      longitude: darkSkyCoordinateJsonAsObject.longitude,
      hour: hour,
      day: darkSkyCoordinateJsonAsObject.daily.data[0]
    }))
  })
  return flattened
}

module.exports = FlattenHoursTransform
