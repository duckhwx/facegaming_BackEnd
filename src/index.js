const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('../config/config.json');
const router = require('./router');

const app = express();
app.set('port', (config.systemPort));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(router);
app.listen(app.get('port'), () => {
	console.log(`Running at ${app.get('port')}`);
});
