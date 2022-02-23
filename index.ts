import express from 'express';

import device from "./src/device"
import status from "./src/status"


const PORT = 8000;
const app = express();


app.use(express.json()) // application/json
app.use(express.urlencoded({ extended: true })) // application/x-www-form-urlencoded

app.use("/device", device)
app.use("/status", status)


app.get('/', (req, res) => res.status(200).send('BESI-C API Server'));

app.get('/time', (req, res) => {
	let time = new Date(Date.now())
	return res.status(200).send({
		iso: time,
		unix: Math.floor(time.getTime()/1000),
		text: time.toString(),
	})
});

app.get('/version', (req, res) => {
	let revision = require('child_process').execSync('git rev-parse HEAD').toString().trim()
	let edits = require('child_process').execSync('git status --short').toString().trim()
	if (edits == "") {
		return res.status(200).send({ git: revision })
	} else {
		return res.status(200).send({ git: revision, changed: true })
	}
});

// Start server
app.listen(PORT, () => {
  console.log(`[server]: Server is running at http://localhost:${PORT}`);
});
