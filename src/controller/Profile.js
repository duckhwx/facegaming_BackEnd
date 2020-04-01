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
		const profPath = path.join(__dirname, '../../uploads/profile');
		// eslint-disable-next-line no-useless-catch
		try {
			if (!fs.existsSync(path.join(`${profPath}/${req.headers.path}`))) {
				fs.mkdirSync(path.join(`${profPath}/${req.headers.path}`));
			}
			if (fs.existsSync(path.join(`${profPath}/${req.headers.path}/${req.headers.filename}`)) && req.headers.filename !== '') {
				fs.unlinkSync(path.join(`${profPath}/${req.headers.path}/${req.headers.filename}`));
			}
		} catch (error) {
			throw (error);
		}
		cb(null, path.join(`${profPath}/${req.headers.path}`));
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

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	const params = {
		userId: userData.ID,
		fileName: req.file.filename,
		fileType: req.file.mimetype,
	};

	Profile.setProfileImage(params, (statusSet, responseMessageSet) => {
		response = {
			error: statusSet,
			message: responseMessageSet,
			data: {},
		};

		if (response.error) {
			res.send(response);
			return;
		}

		const image = {
			pathImg: path.join(__dirname, `../../uploads/profile/${params.userId}/${req.file.filename}`),
			type: params.fileType,
		};

		utils.imgToBase64(image)
			.then((img) => {
				response.data.img = img;
				response.data.filename = req.file.filename;
				res.send(response);
			})
			.catch((err) => {
				console.log(err);
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

	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	const params = {
		userId: userData.ID,
		fileName: req.file.filename,
		fileType: req.file.mimetype,
	};

	Profile.setBackgroundImage(params, (statusSet, responseMessageSet) => {
		response = {
			error: statusSet,
			message: responseMessageSet,
			data: {},
		};

		if (response.error) {
			res.send(response);
			return;
		}

		const image = {
			pathImg: path.join(__dirname, `../../uploads/profile/${params.userId}/${req.file.filename}`),
			type: params.fileType,
		};

		utils.imgToBase64(image)
			.then((img) => {
				response.data.img = img;
				response.data.filename = req.file.filename;
				res.send(response);
			})
			.catch((err) => {
				console.log(err);
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

		response.data.PROF_IMG = '';
		response.data.BACK_IMG = '';

		const filePath = path.join(__dirname, `../../uploads/profile/${params.userID}/`);
		const filePaths = [];

		if (response.data.PROF_IMG_NAME) {
			filePaths.push({
				imgType: 'prof',
				path: path.join(`${filePath}/${response.data.PROF_IMG_NAME}`),
				mimeType: response.data.PROF_IMG_TYPE,
			});
		}

		if (response.data.BACK_IMG_NAME) {
			filePaths.push({
				imgType: 'back',
				path: path.join(`${filePath}/${response.data.BACK_IMG_NAME}`),
				mimeType: response.data.BACK_IMG_TYPE,
			});
		}
		let test = true;

		if (filePaths.length < 1) {
			res.send(response.data);
			return;
		}

		async.each(filePaths, (imgPath, callback) => {
			utils.imgToBase64({
				pathImg: imgPath.path,
				type: imgPath.mimeType,
			})
				.then((img) => {
					if (test) {
						if (imgPath.imgType === 'prof') {
							response.data.PROF_IMG = img;
							callback(null);
							return;
						}
						if (imgPath.imgType === 'back') {
							response.data.BACK_IMG = img;
							callback(null);
						}
					}
				})
				.catch(() => {
					test = false;
					callback(true);
				});
		}, () => {
			res.send(response.data);
		});
	});
});
module.exports = router;
