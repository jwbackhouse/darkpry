
const { Transform } = require('stream')

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
    flattened.push({
      ...hour,
      latitude: darkSkyCoordinateJsonAsObject.latitude,
      longitude: darkSkyCoordinateJsonAsObject.longitude
    })
  })
  return flattened
}

module.exports = FlattenHoursTransform
