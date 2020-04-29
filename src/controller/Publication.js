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
			if (!fs.existsSync(path.join(__dirname, `../../uploads/publications/${req.headers.path}`))) {
				fs.mkdirSync(path.join(__dirname, `../../uploads/publications/${req.headers.path}`));
			}
		} catch (error) {
			throw (error);
		}
		cb(null, (path.join(__dirname, `../../uploads/publications/${req.headers.path}`)));
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

router.post('/deleteFilesFromPubs', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};

	const { deletedFiles } = req.body;
	const { pubId } = req.body;
	const splittedFiles = {
		ids: [],
		fileNames: [],
	};

	for (let index = 0; index < deletedFiles.length; index += 1) {
		const file = deletedFiles[index];
		splittedFiles.ids.push(file.id);
		splittedFiles.fileNames.push(file.name);
	}

	Publication.deleteFile(splittedFiles.ids, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};

		if (result.rowsAffected < deletedFiles.length) {
			res.send(response);
			return;
		}

		if (deletedFiles.length > 0) {
			utils.clearFiles(path.join(__dirname, `../../uploads/publications/${pubId}`), splittedFiles.fileNames);
		}
		res.send(response);
	});
});

router.post('/updatePubText', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};

	const params = {
		pubId: req.body.pubId,
		textfield: req.body.textfield,
	};


	Publication.updatePubText(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};

		res.send(response);
	});
});

router.post('/updatePubFiles', multer(upload).array('images', 4), (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};

	async.each(req.files, (file, callback) => {
		Publication.insertFile(file, req.headers.path, (statusFile, responseMessageFile, totalRecordsFile, resultFile) => {
			response = {
				error: statusFile,
				message: responseMessageFile,
				total: totalRecordsFile,
				data: resultFile,
			};

			if (statusFile) {
				callback('error');
				return;
			}

			callback(null);
		});
	},
	() => {
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
		statusFriend: 'A',
		usersId: [],
		start,
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

		Publication.getPublications(params, (statusPubs, responseMessagePubs, totalRecordsPubs, resultPubs) => {
			response = {
				error: statusPubs,
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
					data: resultFile.recordset,
				};

				const pathProfile = path.join(__dirname, '../../uploads/profile/');
				async.each(pubs, (pub, callback) => {
					let pubFiles = [];
					const image = {
						pathImg: `${pathProfile}/${pub.USER_ID}/${pub.FILE_NAME}`,
						type: pub.FILE_TYPE,
					};
					pub.FILES = {
						error: false,
						data: [],
					};

					pubFiles = resultFile.recordset.filter((file) => {
						if (file.PUBLICATION_ID !== pub.ID) {
							return false;
						}
						return file;
					}).map((file) => file);

					const p1 = utils.imgToBase64(image)
						.then((profImg) => profImg);

					const p2 = utils.imgsToBase64Pubs(pub.ID, pubFiles)
						.then((files) => ({
							error: false,
							data: files,
						}))
						.catch(() => ({
							error: true,
						}));

					Promise.all([p1, p2]).then((promiseResp) => {
						const [promise1, promise2] = promiseResp;
						pub.PROFILE_IMG = promise1;

						if (promise2.error) {
							pub.FILES = {
								error: true,
								data: '',
							};
							callback(null);
							return;
						}
						pub.FILES.data = promise2.data;
						callback(null);
					});
				}, () => {
					res.send(pubs);
				});
			});
		});
	});
});

router.get('/selectPub/:pubId', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};

	const { pubId } = req.params;

	Publication.getPublication(pubId, (status, responseMessage, totalRecords, result) => {
		response = {
			error: {
				status,
				type: 'text',
			},
			message: responseMessage,
			total: totalRecords,
			data: result,
		};

		if (response.error.status) {
			res.send(response);
			return;
		}

		const publication = response.data;

		Publication.getFiles(pubId, (statusFile, responseMessageFile, totalRecordsFile, resultFile) => {
			if (resultFile.rowsAffected < 1) {
				res.send(response);
				return;
			}
			response = {
				error: {
					status: statusFile,
					type: 'files',
				},
				message: responseMessageFile,
				total: totalRecordsFile,
				data: resultFile.recordset,
			};

			if (response.error.status) {
				response.data = publication;
				res.send(response);
				return;
			}

			publication.files = resultFile.recordset;
			const pathPubFiles = path.join(__dirname, `../../uploads/publications/${pubId}`);

			async.each(publication.files, (file, callback) => {
				const image = {
					pathImg: path.join(`${pathPubFiles}/${file.FILE_NAME}`),
					type: file.FILE_TYPE,
				};

				utils.imgToBase64(image)
					.then((img) => {
						file.BS64FILE = img;
						callback(null);
					})
					.catch((err) => {

					});
			},
			() => {
				response.data = publication;
				res.send(response);
			});
		});
	});
});

router.post('/uploadFile', multer(upload).array('files', 4), (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 0,
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

router.delete('/deletePub/:pubId', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};

	const { pubId } = req.params;

	Publication.deletePublication(pubId, (status, responseMessage, totalRecords, result) => {
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

		utils.clearFolder(path.join(__dirname, `../../uploads/publications/${pubId}`));

		Publication.deleteAllFiles(pubId, (statusFile, responseMessageFile, totalRecordsFile, resultFile) => {
			response = {
				error: statusFile,
				message: responseMessageFile,
				total: totalRecordsFile,
				data: resultFile,
			};

			if (statusFile) {
				res.send(response);
				return;
			}
			res.send(response);
		});
	});
});
module.exports = router;
