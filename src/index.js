const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

let io = '';
const app = express();
const socket = require('./socket');
const router = require('./router');
const config = require('../config/config.json');


app.set('port', (config.systemPort));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(router);

const server = app.listen(app.get('port'), () => {
	console.log(`Running at ${app.get('port')}`);
});

socket(require('socket.io')(server));
