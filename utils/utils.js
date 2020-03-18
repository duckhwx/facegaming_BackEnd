const jwt = require('jsonwebtoken');
const base64 = require('file-base64');
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

exports.imgsToBase64 = async (pubId, files, pathUserImg) => new Promise((resolve, reject) => {
	const array = [];
	try {
		// eslint-disable-next-line no-restricted-syntax
		for (const file of files) {
			// eslint-disable-next-line no-continue
			if (file.PUBLICATION_ID !== pubId) continue;
			image2base64(path.join(__dirname, `../uploads/${pubId}/${file.FILE_NAME}`))
				.then((response) => {
					array.push({
						ID: file.ID,
						FILE: `data:image/jpg;base64,${response}`,
					});
				})
				.catch((err) => {
					reject(err);
				});
		}

		image2base64(pathUserImg)
			.then((response) => {
				array.push({
					userImg: `data:image/jpg;base64,${response}`,
				});
			});
		resolve(array);
	} catch (err) {
		reject(err);
	}
});

exports.imgToBase64 = (file, callback) => {
	base64.encode(file, (err, fileBase64) => {
		if (err) {
			callback(null, err);
		}

		callback(`data:image/jpg;base64,${fileBase64}`);
	});
};
