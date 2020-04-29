const express = require('express');
const async = require('async');
const path = require('path');
const moment = require('moment');
const Friends = require('../model/Friends');
const utils = require('../../utils/utils');

const router = express.Router();

router.get('/selectFriends', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	const params = {
		id: userData.ID,
		usersId: [],
	};
	Friends.updateFriends(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};
		//	console.log(response);
		res.send(response);
	});
});

router.get('/getAddedFriends', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	const params = {
		id: userData.ID,
		statusFriend: 'A',
		usersId: [],
	};

	utils.getFriends(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};

		if (status) {
			res.send(response);
			return;
		}

		if (totalRecords < 1) {
			response.message = 'Você não possui amigos';
			res.send(response);
			return;
		}

		params.usersId = utils.separateFriends({
			userId: params.id,
			friends: result,
		});

		Friends.getFriendsData(params, (statusFriends, responseMessageFriends, totalRecordsFriends, resultFriends) => {
			response = {
				error: statusFriends,
				message: responseMessageFriends,
				total: totalRecordsFriends,
				data: resultFriends,
			};

			if (statusFriends) {
				res.send(response);
				return;
			}

			async.each(response.data, (friend, callback) => {
				const file = {
					pathImg: path.join(__dirname, `../../uploads/profile/${friend.ID}/${friend.FILE_NAME}`),
					type: friend.FILE_TYPE,
				};
				utils.imgToBase64(file)
					.then((img) => {
						// eslint-disable-next-line no-param-reassign
						friend.PROFILE_IMG = img;
						callback(null);
					});
			},
			() => {
				res.send(response);
			});
		});
	});
});

router.get('/getSendFriends', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	const params = {
		id: userData.ID,
		statusFriend: 'P',
		usersId: [],
	};

	Friends.getSendFriends(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};

		if (status) {
			res.send(response);
			return;
		}

		if (totalRecords < 1) {
			response.message = 'Você não possui nenhum pedido de amizade enviado';
			res.send(response);
			return;
		}

		params.usersId = utils.separateFriends({
			userId: params.id,
			friends: result,
		});

		Friends.getFriendsData(params, (statusFriends, responseMessageFriends, totalRecordsFriends, resultFriends) => {
			response = {
				error: statusFriends,
				message: responseMessageFriends,
				total: totalRecordsFriends,
				data: resultFriends,
			};

			if (statusFriends) {
				res.send(response);
				return;
			}

			async.each(response.data, (friend, callback) => {
				const file = {
					pathImg: path.join(__dirname, `../../uploads/profile/${friend.ID}/${friend.FILE_NAME}`),
					type: friend.FILE_TYPE,
				};
				utils.imgToBase64(file)
					.then((img) => {
						// eslint-disable-next-line no-param-reassign
						friend.PROFILE_IMG = img;
						callback(null);
					});
			},
			() => {
				res.send(response);
			});
		});
	});
});

router.get('/getPedingFriends', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	const params = {
		id: userData.ID,
		statusFriend: 'P',
		usersId: [],
	};

	Friends.getPedingFriends(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};

		if (status) {
			res.send(response);
			return;
		}

		if (totalRecords < 1) {
			response.message = 'Você não possui nenhuma amizades pendentes';
			res.send(response);
			return;
		}

		params.usersId = utils.separateFriends({
			userId: params.id,
			friends: result,
		});

		Friends.getFriendsData(params, (statusFriends, responseMessageFriends, totalRecordsFriends, resultFriends) => {
			response = {
				error: statusFriends,
				message: responseMessageFriends,
				total: totalRecordsFriends,
				data: resultFriends,
			};

			if (statusFriends) {
				res.send(response);
				return;
			}

			async.each(response.data, (friend, callback) => {
				const file = {
					pathImg: path.join(__dirname, `../../uploads/profile/${friend.ID}/${friend.FILE_NAME}`),
					type: friend.FILE_TYPE,
				};
				utils.imgToBase64(file)
					.then((img) => {
						// eslint-disable-next-line no-param-reassign
						friend.PROFILE_IMG = img;
						callback(null);
					});
			},
			() => {
				res.send(response);
			});
		});
	});
});

router.put('/addFriend', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);
	const params = {
		friendId: req.body.friendId,
		userId: userData.ID,
	};

	Friends.addFriend(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};

		res.send(response);
	});
});

router.put('/cancelFriends', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	const params = req.body;
	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	Friends.cancelFriends(params, userData, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};
		res.send(response);
	});
});

router.post('/inviteUser', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	let params = {
		userId: userData.ID,
		nickname: req.body.nickname,
	};

	Friends.verifyUser(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};

		if (status) {
			res.send(response);
			return;
		}

		params = {
			sender: userData.ID,
			receiver: result.ID,
		};

		Friends.inviteUser(params, (statusInvite, responseMessageInvite, totalRecordsInvite, resultInvite) => {
			response = {
				error: statusInvite,
				message: responseMessageInvite,
				total: totalRecordsInvite,
				data: params.userId2,
			};

			res.send(response);
		});
	});
});

module.exports = router;
