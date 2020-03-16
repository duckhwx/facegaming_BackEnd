const express = require('express');
const multer = require('multer');
const async = require('async');
const fs = require('fs');
const path = require('path');
const Profile = require('../model/Profile');
const utils = require('../../utils/utils');

const router = express.Router();

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		// eslint-disable-next-line no-useless-catch
		try {
			if (!fs.existsSync(path.join(__dirname, `../../uploads/profile/${req.headers.path}`))) {
				fs.mkdirSync(path.join(__dirname, `../../uploads/profile/${req.headers.path}`));
			}
		} catch (error) {
			throw (error);
		}
		cb(null, path.join(__dirname, `../../uploads/profile/${req.headers.path}`));
	},
	filename: (req, file, cb) => {
		cb(null, Date.now().toString() + file.originalname.replace(' ', ''));
	},
});
const upload = multer({ storage });

router.post('/', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
	};

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	const params = {
		user: req.body.user,
		email: req.body.email,
		name: req.body.name,
		lastName: req.body.lastName,
		country: req.body.country,
		id: userData.ID,
	};

	Profile.updateProfile(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};
	});
	res.send(response);
});

router.post('/setProfImg', upload.single('image'), (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};
	console.log('profile');
	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	const params = {
		userId: userData.ID,
		fileName: req.file.filename,
	};

	Profile.setProfileImage(params, (statusSet, responseMessageSet, totalRecordsSet, resultSet) => {
		response = {
			error: statusSet,
			message: responseMessageSet,
			total: totalRecordsSet,
			data: resultSet,
		};

		if (response.error) {
			res.send(response);
			return;
		}

		const imgPath = path.join(__dirname, `../../uploads/profile/${params.userId}/${req.file.filename}`);

		utils.imgToBase64(imgPath, (img, error) => {
			response.data = img;
			res.send(response);
		});
	});
});

router.post('/setBackImg', upload.single('image'), (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};
	console.log('background');
	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	const params = {
		userId: userData.ID,
		fileName: req.file.filename,
	};

	Profile.setBackgroundImage(params, (statusSet, responseMessageSet, totalRecordsSet, resultSet) => {
		response = {
			error: statusSet,
			message: responseMessageSet,
			total: totalRecordsSet,
			data: resultSet,
		};

		if (response.error) {
			res.send(response);
			return;
		}

		const imgPath = path.join(__dirname, `../../uploads/profile/${params.userId}/${req.file.filename}`);

		utils.imgToBase64(imgPath, (img, error) => {
			response.data = img;
			res.send(response);
		});
	});
});

router.get('/getProfileData', (req, res) => {
	let response = {
		error: false,
		message: '',
		total: 0,
		data: '',
	};

	const { token } = req.headers;
	const decoded = utils.decodeJwt(token);

	const params = {
		userID: decoded.userData.ID,
	};

	Profile.getProfileData(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};

		if (response.error) {
			res.send(response);
			return;
		}

		const filePath = path.join(__dirname, `../../uploads/profile/${params.userID}/`);
		const filePaths = [
			{
				imgType: 'prof',
				path: path.join(`${filePath}/${response.data.PROF_IMG}`),
			},
			{
				imgType: 'back',
				path: path.join(`${filePath}/${response.data.BACK_IMG}`),
			},
		];

		async.each(filePaths, (imgPath, callback) => {
			utils.imgToBase64(imgPath.path, (img, error) => {
				if (error) {
					return callback(imgPath.imgType);
				}

				if (imgPath.imgType === 'prof') {
					response.data.PROF_IMG = img;
					return callback(null);
				}

				response.data.BACK_IMG = img;
				return callback(null);
			});
		}, (type) => {
			if (type) {
				if (type === 'prof') {
					response.data.PROF_IMG = '';
					res.send(response.data);
				}

				response.data.BACK_IMG = '';
			}

			res.send(response.data);
		});
	});
});
module.exports = router;
