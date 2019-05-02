/* jslint es6 */
const fetch = require('node-fetch')
const fs = require('fs')
const parallel = require('async-await-parallel')
let converter = require('json-2-csv')

// CONSTANTS
const NUMBER_OF_CONCURRENT_REQUESTS = 10 // probably set to 100 for large datasets
const LIMIT_REQUESTS = 30 // set to 0 to run for all the data
const DARK_SKY_TOKEN = process.env.DARK_SKY_TOKEN
const DARK_SKY_HOSTNAME = 'api.darksky.net'
const DARK_SKY_PATH = 'forecast'
const DARK_SKY_PROTOCOL = 'https'
const INPUT_FILE_NAME = './input.csv'
const SAMPLE_INPUT_FILE_NAME = 'sampleInput.csv'
const CSV_OUTPUT_FILE_NAME = './output.csv'
const JSON_OUTPUT_FILE_NAME =  './output.json'

const loadInputData = async () => {
  console.log("loading data")
  const inputDataAsString = fs.existsSync(INPUT_FILE_NAME) ? fs.readFileSync(INPUT_FILE_NAME) : fs.readFileSync(SAMPLE_INPUT_FILE_NAME)
  const options = {
    keys: ['lat', 'long', 'time'],
    wrap: "",
    prependHeader: true
  }
  console.log(inputDataAsString.toString())
  console.log("parsing data")
  let inputData = await converter.csv2jsonAsync(inputDataAsString.toString(), options)
  console.log("parsed data")
  console.dir(inputData)
  inputData = LIMIT_REQUESTS ? inputData.slice(0, LIMIT_REQUESTS) : inputData;
  console.dir(inputData)
  return inputData
}

const writeOutputData = async (returnedDataAsListOfObjects) => {
  fs.writeFileSync(JSON_OUTPUT_FILE_NAME, JSON.stringify(returnedDataAsListOfObjects))
  const options = {
      keys: ['latitude', 'longitude', 'currently.summary', ],
      wrap: "",
      prependHeader: true
  }
  let returnedDataAsString = await converter.json2csvAsync(returnedDataAsListOfObjects, options)
  fs.writeFileSync(CSV_OUTPUT_FILE_NAME, returnedDataAsString)
  console.log(`Data saved to ${CSV_OUTPUT_FILE_NAME} and ${JSON_OUTPUT_FILE_NAME}`)
}

const getDarkSkyDataForCoordinates = async (coordinatesList) => {
  const listOfRequestFunctionsNotYetExecuted = coordinatesList.map((coordinate) => {
    return async () => {
      console.dir(coordinate)
      console.log(`Getting data for lat: ${coordinate.lat} long: ${coordinate.long} from ${DARK_SKY_HOSTNAME} at ${coordinate.time}`)
      const coordinateTime = new Date(coordinate.time)
      const unixTimestamp = parseInt((coordinateTime.getTime() / 1000).toFixed(0))
      const formattedRequestURLForCoordinateAsString = `${DARK_SKY_PROTOCOL}://${DARK_SKY_HOSTNAME}/${DARK_SKY_PATH}/${DARK_SKY_TOKEN}/${coordinate.lat},${coordinate.long},${unixTimestamp}`
      console.log(formattedRequestURLForCoordinateAsString)
      const darkSkyCoordinateResponse = await fetch(formattedRequestURLForCoordinateAsString)
      const darkSkyCoordinateJsonAsObject = await darkSkyCoordinateResponse.json()
      return darkSkyCoordinateJsonAsObject
    }
  })
  const listOfAllTheRequestsAsTheyAreExecuting = await parallel(listOfRequestFunctionsNotYetExecuted, NUMBER_OF_CONCURRENT_REQUESTS)
  return Promise.all(listOfAllTheRequestsAsTheyAreExecuting)
}

const main = async () => {
  if (!DARK_SKY_TOKEN) { throw new Error('The environment variable DARK_SKY_TOKEN must be set') };
  const inputDataAsListOfObjects = await loadInputData()
  const returnedDataAsListOfObjects = await getDarkSkyDataForCoordinates(inputDataAsListOfObjects, NUMBER_OF_CONCURRENT_REQUESTS)
  return writeOutputData(returnedDataAsListOfObjects)
}

main().catch((error) => {
  console.log('There was an error')
  console.error(error)
})
