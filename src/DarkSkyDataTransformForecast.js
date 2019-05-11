
const fetch = require('node-fetch')
const through2Concurrent = require('through2-concurrent')

const getDarkSkyData = async (hostname, protocol, path, token, coordinate) => {
  console.log(`Getting data for lat: ${coordinate.lat} long: ${coordinate.long} from ${hostname}`)
  const formattedRequestURLForCoordinateAsString = `${protocol}://${hostname}/${path}/${token}/${coordinate.lat},${coordinate.long}?exclude=flags,alerts,minutely,currently&units=si`
  const darkSkyCoordinateResponse = await fetch(formattedRequestURLForCoordinateAsString)
  return darkSkyCoordinateResponse.json()
}

const darkSkyDataTransformForecast = (hostname, protocol, path, token, concurrentConnections) => {
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

module.exports = darkSkyDataTransformForecast
