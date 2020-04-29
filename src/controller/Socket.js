const Socket = require('../model/Socket');
const utils = require('../../utils/utils');

exports.setSocket = (params, callback) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};

	const { token } = params;
	const { userData } = utils.decodeJwt(token);

	const param = {
		userId: userData.ID,
		socketId: params.socketId,
	};

	Socket.setSocket(param, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			response: responseMessage,
			total: totalRecords,
			data: result,
		};

		callback(response);
	});
};

exports.getSocketData = (params, callback) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};

	Socket.getSocketData(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			response: responseMessage,
			total: totalRecords,
			data: result,
		};

		callback(response);
	});
};

exports.unsetSocket = (params, callback) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};

	Socket.unsetSocket(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			response: responseMessage,
			total: totalRecords,
			data: result,
		};

		callback(response);
	});
};
