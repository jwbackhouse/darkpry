/* jslint es6 */
const fetch = require('node-fetch')
const fs = require('fs')
const parallel = require('async-await-parallel')

const NUMBER_OF_CONCURRENT_REQUESTS = 10
const DARK_SKY_TOKEN = process.env.DARK_SKY_TOKEN
const DARK_SKY_HOSTNAME = 'api.darksky.net'
const DARK_SKY_PATH = 'forecast'
const DARK_SKY_PROTOCOL = 'https'

const main = async () => {
  if (!DARK_SKY_TOKEN) { throw new Error('The environment variable DARK_SKY_TOKEN must be set') };
  let inputListOfCoordinatesAsAString = ''
  if (fs.existsSync('input.json')) {
    inputListOfCoordinatesAsAString = fs.readFileSync('input.json')
  } else {
    console.log('Did not find an input.json file, using sampleInput.json')
    inputListOfCoordinatesAsAString = fs.readFileSync('sampleInput.json')
  }
  const inputListOfTheCoordinatesAsObjects = JSON.parse(inputListOfCoordinatesAsAString)
  const returnedDataAsListOfObjects = []

  const listOfRequestFunctionsNotYetExecuted = inputListOfTheCoordinatesAsObjects.map((coordinate) => {
    return async () => {
      console.log(`Getting data for lat: ${coordinate.lat} long: ${coordinate.long} from ${DARK_SKY_HOSTNAME}`)
      const formattedRequestURLForCoordinateAsString = `${DARK_SKY_PROTOCOL}://${DARK_SKY_HOSTNAME}/${DARK_SKY_PATH}/${DARK_SKY_TOKEN}/${coordinate.lat},${coordinate.long}`
      console.log(formattedRequestURLForCoordinateAsString)
      const darkSkyCoordinateResponse = await fetch(formattedRequestURLForCoordinateAsString)
      const darkSkyCoordinateJsonAsObject = await darkSkyCoordinateResponse.json()
      returnedDataAsListOfObjects.push(darkSkyCoordinateJsonAsObject)
    }
  })

  const listOfAllTheRequestsAsTheyAreExecuting = await parallel(listOfRequestFunctionsNotYetExecuted, NUMBER_OF_CONCURRENT_REQUESTS)
  await Promise.all(listOfAllTheRequestsAsTheyAreExecuting)
  let returnedDataAsString = JSON.stringify(returnedDataAsListOfObjects)
  fs.writeFileSync('output.json', returnedDataAsString)
  console.log('Data saved to output.json')
}

main().catch((error) => {
  console.log('There was an error')
  console.error(error)
})
