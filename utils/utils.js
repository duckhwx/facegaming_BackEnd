const jwt = require('jsonwebtoken');
const base64 = require('file-base64');
const fs = require('fs');
const image2base64 = require('image-to-base64');
const path = require('path');
const db = require('../banco/Sql');

exports.validAuthorization = (req, res, next) => {
	const { token } = req.headers;
	const secret = 'segredo';
	jwt.verify(token, secret, (err, decoded) => {
		if (err) {
			res.status(401).send({ error: true, message: 'Usuário sem acesso para está area' });
			return;
		}

		next();
	});
};

exports.decodeJwt = (token) => {
	const secret = 'segredo';
	const decoded = jwt.verify(token, secret);

	return decoded;
};

exports.deleteFileIncertions = (pubId) => {
	let qry = 'DELETE				 ';
	qry += '	FROM				 ';
	qry += 'FILES					 ';
	qry += '	WHERE				 ';
	qry += `PUBLICATION_ID = ${pubId}`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			dbConn.close();
			return;
		}

		db.execute(ps, qry, null, (recordset, affected, errExec) => {

		});
	});
};

exports.imgsToBase64Pubs = async (pubId, files) => new Promise((resolve, reject) => {
	const array = [];
	if (files.length < 1) {
		resolve('');
	}
	try {
		// eslint-disable-next-line no-restricted-syntax
		for (const file of files) {
			// eslint-disable-next-line no-continue
			if (file.PUBLICATION_ID !== pubId) continue;
			base64.encode(path.join(__dirname, `../uploads/publications/${pubId}/${file.FILE_NAME}`), (err, base64file) => {
				if (err) {
					reject(err);
				}
				array.push({
					ID: file.ID,
					FILE: `data:${file.FILE_TYPE};base64,${base64file}`,
					FILE_TYPE: file.FILE_TYPE,
				});

				if (array.length === files.length) {
					resolve(array);
				}
			});
		}
	} catch (err) {
		reject(err);
	}
});

exports.imgToBase64 = (file) => new Promise((resolve, reject) => {
	if (!fs.existsSync(file.pathImg)) {
		resolve('');
	}
	base64.encode(file.pathImg, (err, fileBase64) => {
		if (err) {
			reject(err);
		}

		resolve(`data:${file.type};base64,${fileBase64}`);
	});
});

exports.clearFiles = (pathPub, fileNames) => {
	fs.readdir(pathPub, (err, files) => {
		for (let index = 0; index < files.length; index += 1) {
			const file = files[index];

			if (!fileNames.includes(file)) {
				fs.unlinkSync(path.join(`${pathPub}/${file}`));
			}
		}
	});
};
