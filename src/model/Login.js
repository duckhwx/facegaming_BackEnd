const jwt = require('jsonwebtoken');
const db = require('../../banco/Sql');

exports.userLogin = (params, callback) => {
	const secret = 'segredo';
	const param = {
		USER: params.newObject.login,
		PASSWORD: params.newObject.senha,
	};
	let token = '';
	let qry = '';
	qry = 'SELECT									';
	qry += '	ID,									';
	qry += 'USERNAME,									';
	qry += '	PASSWORD								';
	qry += 'FROM user_account WHERE USERNAME = @USER	';
	qry += '	AND PASSWORD = @PASSWORD				';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('USER', db.getInput('varchar', '60'));
		ps.input('PASSWORD', db.getInput('varchar', '60'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Falha no Login');
				return;
			}

			if (recordset.recordset.length < 1) {
				dbConn.close();
				callback(true, 'Usuário inexistente');
				return;
			}

			token = jwt.sign({ userData: recordset.recordset[0] }, secret, {
				expiresIn: 86400,
			});

			recordset.recordset[0].TOKEN = token;
			qry = 'UPDATE									 ';
			qry += '	USER_ACCOUNT						 ';
			qry += 'SET										 ';
			qry += `	TOKEN = '${token}'					 `;
			qry += `WHERE id = '${recordset.recordset[0].ID}'`;

			db.quickExecute(qry, (errUpd, rest, rowUpd) => {
				if (errUpd) {
					callback(true, 'Erro ao logar');
					dbConn.close();
					return;
				}
				callback(false, '', recordset.rowsAffected, recordset.recordset[0]);
			});
		});
	});
};

exports.validToken = (token, callback) => {
	let qry = '';
	const param = {};

	qry = 'SELECT                                  ';
	qry += '    COUNT(USER_ACCOUNT.TOKEN) AS TOKEN ';
	qry += 'FROM                                   ';
	qry += '    USER_ACCOUNT                       ';
	qry += 'WHERE                                  ';
	qry += `USER_ACCOUNT.TOKEN = '${token}'        `;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			const data = recordset;
			if (errExec) {
				callback(true, 'Token invalido');
				dbConn.close();
				return;
			}
			if (recordset.rowsAffected <= 0) {
				callback(true, 'Token invalido');
				dbConn.close();
				return;
			}
			if (data.recordset.TOKEN <= 0) {
				callback(true, 'Token invalido');
				dbConn.close();
				return;
			}
			callback(false, '', data.recordset.TOKEN);
			dbConn.close();
		});
	});
};
