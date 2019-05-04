require('dotenv').config()

// CONSTANTS
const DARK_SKY_TOKEN = process.env.DARK_SKY_TOKEN
const DARK_SKY_HOSTNAME = 'api.darksky.net'
const DARK_SKY_PATH = 'forecast'
const DARK_SKY_PROTOCOL = 'https'
const INPUT_FILE_NAME = './input.csv'
const CSV_OUTPUT_FILE_NAME = './out/output.csv'

// EXTERNAL DEPENDENCIES
const fs = require('fs')
const csv = require('csv-parser')
const { pipeline } = require('stream')
const json2csv = require('json2csv')

// INTERNAL DEPENDENCIES
const darkSkyDataTransform = require('./src/DarkSkyDataTransform')
const FlattenHoursTransform = require('./src/FlattenHoursTransform')

// const csvFields = ['latitude', 'longitude', 'summary'] // Use this if we only want specific fields
const csvOptions = {} // { csvFields }
const csvTransformOptions = { highWaterMark: 8192, objectMode: true }
const toCSVTransform = new json2csv.Transform(csvOptions, csvTransformOptions)

const readStream = fs.createReadStream(INPUT_FILE_NAME)
const writeStream = fs.createWriteStream(CSV_OUTPUT_FILE_NAME, {})

pipeline(
  readStream,
  csv(),
  darkSkyDataTransform(DARK_SKY_HOSTNAME, DARK_SKY_PROTOCOL, DARK_SKY_PATH, DARK_SKY_TOKEN),
  new FlattenHoursTransform(),
  toCSVTransform,
  writeStream,
  (error) => {
    if (error) {
      console.error('Pipeline failed', error)
    } else {
      console.log('Pipeline succeeded')
    }
  })
