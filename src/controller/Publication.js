/* eslint-disable no-param-reassign */
const express = require('express');
const moment = require('moment');
const multer = require('multer');
const fs = require('fs');
const async = require('async');
const path = require('path');
const utils = require('../../utils/utils');
const Publication = require('../model/Publication');


const router = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// eslint-disable-next-line no-useless-catch
		try {
			if (!fs.existsSync(path.join(__dirname, `../../uploads/${req.headers.path}`))) {
				fs.mkdirSync(path.join(__dirname, `../../uploads/${req.headers.path}`));
			}
		} catch (error) {
			throw (error);
		}
		cb(null, (path.join(__dirname, `../../uploads/${req.headers.path}`)));
	},
	filename: (req, file, cb) => {
		cb(null, Date.now().toString() + file.originalname.replace(' ', ''));
	},
});

const upload = multer({ storage });

router.post('/insertPub', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	const dateTime = moment().format('YYYYMMDD hh:mm:ss');

	const params = {
		id: userData.ID,
		textfield: req.body.textfield,
		dateTime,
	};

	Publication.createPub(params, (statusPub, responseMessagePub, totalRecordsPub, resultPub) => {
		response = {
			error: statusPub,
			message: responseMessagePub,
			total: totalRecordsPub,
			data: resultPub,
		};

		res.send(response);
	});
});

router.get('/selectPubs/:start', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);
	let { start } = req.params;

	if (start === '') {
		start = 0;
	}

	const params = {
		id: userData.ID,
		usersId: [],
		start,
	};

	Publication.getFriends(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};

		if (status) {
			res.send(response.error);
			return;
		}

		result.recordset.forEach((friends) => {
			if (friends.USER_ID1 !== params.id) {
				params.usersId.push(friends.USER_ID1);
				return;
			}

			params.usersId.push(friends.USER_ID2);
		});

		Publication.getPublications(params, (statusPubs, responseMessagePubs, totalRecordsPubs, resultPubs) => {
			response = {
				error: statusPubs,
				errorType: 'pubs',
				message: responseMessagePubs,
				total: totalRecordsPubs,
				data: resultPubs,
			};

			if (response.error || response.total <= 0) {
				res.send(response);
				return;
			}

			const pubsId = [];
			const pubs = response.data;

			for (let index = 0; index < response.data.length; index += 1) {
				pubsId.push(response.data[index].ID);
			}

			Publication.getFiles(pubsId, (statusFile, responseMessageFile, totalRecordsFile, resultFile) => {
				response = {
					error: statusFile,
					message: responseMessageFile,
					total: totalRecordsFile,
					data: resultFile,
				};
				console.log(response.data);

				const pathProfile = path.join(__dirname, '../../uploads/profile/');
				async.each(pubs, (pub, callback) => {
					const pathUserImg = `${pathProfile}/${pub.USER_ID}/${pub.FILE_NAME}`;
					let pubFiles = [];

					pubFiles = resultFile.filter((file) => {
						if (file.PUBLICATION_ID !== pub.ID) {
							return false;
						}
						return file;
					}).map((file) => file);

					const p1 = utils.imgsToBase64(pub.ID, pubFiles, pathUserImg)
						.then((bs64Files) => ({
							error: false,
							data: bs64Files,
						}))
						.catch(() => ({
							error: true,
						}));

					const p2 = utils.imgToBase642(pathUserImg)
						.then((responseImg) => responseImg);

					Promise.all([p1, p2]).then((responseAll) => {
						const [resp1, resp2] = responseAll;

						if (resp1.error) {
							pub.FILES.push({
								error: true,
								message: 'Houve um erro ao coletar o arquivo',
							});
							callback('Error');
						}

						pub.FILES = resp1;
						pub.PROFILE_IMG = resp2;
						callback(null);
					});
				}, (err) => {
					response = {
						error: false,
						data: pubs,
					};
					if (err) {
						response.error = 'files';
						res.send(response);
						return;
					}
					res.send(response);
				});
			});
		});
	});
});

router.post('/uploadFile', multer(upload).array('files', 4), (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};
	let validation = true;

	async.each(req.files, (element, next) => {
		Publication.insertFile(element, req.headers.path, (statusFile, responseMessageFile, totalRecordsFile, resultFile) => {
			response = {
				error: statusFile,
				message: responseMessageFile,
				total: totalRecordsFile,
				data: resultFile,
			};
			if (statusFile) {
				validation = false;
				return next(true);
			}
			if (validation) {
				next(null);
			}
		});
	}, (err) => {
		let resp = {
			error: true,
			message: '',
		};
		if (err) {
			resp = {
				error: true,
				message: 'Houve um erro ao enviar os arquivos',
			};
			res.send(resp);
			return;
		}
		resp = {
			error: false,
			message: 'Publicação cadastrada',
		};
		res.send(resp);
	});
});
module.exports = router;
