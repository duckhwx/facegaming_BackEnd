const express = require('express');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const Login = require('../model/Login');

const router = express.Router();

router.post('/', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	const params = req.body;

	Login.userLogin(params, (status, errorMessage, totalrecords, result) => {
		response = {
			error: status,
			message: errorMessage,
			total: totalrecords,
			data: result,
		};

		if (response.error) {
			res.send(response);
			return;
		}

		res.send(response);
	});
});

router.get('/checktoken', (req, res) => {
	const { token } = req.headers;
	const secret = 'segredo';
	let jwtDate = '';
	let actualDate = '';
	Login.validToken(token, (status, errorMessage, result) => {
		if (status) {
			res.status(401).send({ error: true, message: 'Usuário sem acesso para está área' });
			return;
		}
		if (result <= 0) {
			res.status(401).send({ error: true, message: 'Usuário sem acesso para está area' });
			return;
		}
		jwt.verify(token, secret, (err, decoded) => {
			if (err) {
				res.status(401).send({ error: true, message: 'Usuário sem acesso para está area' });
				return;
			}

			jwtDate = moment.unix(decoded.iat).format('YYYYMMDD');
			actualDate = moment().format('YYYYMMDD');
			if (jwtDate < actualDate) {
				res.status(401).send({ error: true, message: 'Usuário sem acesso para está area' });
				return;
			}
			res.send({ error: false, message: '', result: decoded });
		});
	});
});

module.exports = router;
