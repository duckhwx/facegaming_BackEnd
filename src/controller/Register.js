const express = require('express');
const Register = require('../model/Register.js');

const router = express.Router();

router.post('/', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	// todo o conteudo mandado pela requisição
	const params = req.body;

	Register.verifyUser(params, (status, errorMessage, totalRecords, result) => {
		response = {
			error: status,
			message: errorMessage,
		};

		if (response.error) {
			res.send(response);
			return;
		}

		Register.newUser(params, (status1, errMessage, allRecords, end) => {
			response = {
				error: status1,
				message: errMessage,
				total: allRecords,
				data: end,
			};
			res.send(response);
		});
	});
});

module.exports = router;
