
//https://api.darksky.net/forecast/d3cdf47118616664be90631b60bbc0a2/42.3601,-71.0589
const fetch = require('node-fetch');
const fs = require('fs');
const asyncForEach = require('./asyncForEach');

const main = async () => {
	const DARK_SKY_TOKEN = process.env.DARK_SKY_TOKEN;
	if (!DARK_SKY_TOKEN) { throw new Error("The environment variable DARK_SKY_TOKEN must be set") }
	const path = `/forecast/${DARK_SKY_TOKEN}/`
	let myCoordsData;
	if (fs.existsSync('input.json')) {
		console.log("Found an input.json file, using this")
		myCoordsData = fs.readFileSync('input.json');
	} else {
		console.log("Did not find an input.json file, using sampleInput.json")
		myCoordsData = fs.readFileSync('sampleInput.json');
	}
	const myCoords = JSON.parse(myCoordsData);

	const returnedData = [];
	await asyncForEach(myCoords, async (coordinate) => {
		console.log("Getting data for lat: " + coordinate.lat + " long: " + coordinate.long);
		const options = {
			hostname: 'api.darksky.net',
			port: 443,
			path: path + coordinate.lat + "," + coordinate.long,
			method: 'GET'
		}
		const response = await fetch("https://api.darksky.net/forecast/d3cdf47118616664be90631b60bbc0a2/42.3601,-71.0589")
		const json = await response.json();
		returnedData.push(json);
	});

	let data = JSON.stringify(returnedData);
	fs.writeFileSync('output.json', data);
	console.log("Data saved to output.json");
}

main().catch((error) => {
	console.log("There was an error");
	console.error(error);
})
