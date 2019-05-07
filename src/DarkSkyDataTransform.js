
const fetch = require('node-fetch')
const through2Concurrent = require('through2-concurrent')

const getDarkSkyData = async (hostname, protocol, path, token, coordinate) => {
  console.log(`Getting data for lat: ${coordinate.lat} long: ${coordinate.long} from ${hostname} at ${coordinate.time}`)
  const coordinateTime = coordinate.time
  const formattedRequestURLForCoordinateAsString = `${protocol}://${hostname}/${path}/${token}/${coordinate.lat},${coordinate.long},${coordinateTime}?exclude=flags,minutely,currently&units=si`
  const darkSkyCoordinateResponse = await fetch(formattedRequestURLForCoordinateAsString)
  return darkSkyCoordinateResponse.json()
}

const darkSkyDataTransform = (hostname, protocol, path, token, concurrentConnections) => {
  return through2Concurrent.obj(
    { maxConcurrency: concurrentConnections },
    function (chunk, enc, callback) {
      var self = this
      getDarkSkyData(hostname, protocol, path, token, chunk).then((newChunk) => {
        self.push(newChunk)
        callback()
      }).catch(callback)
    })
}

module.exports = darkSkyDataTransform
