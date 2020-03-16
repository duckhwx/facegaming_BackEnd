const db = require('../../banco/Sql');

exports.newUser = (params, callback) => {
	const param = {
		USERNAME: params.newObject.userName,
		EMAIL: params.newObject.email,
		PASSWORD: params.newObject.password,
	};
	let qry = '';
	qry += 'INSERT												';
	qry += '	INTO											';
	qry += 'USER_ACCOUNT										';
	qry += '	(ID, USERNAME, EMAIL, PASSWORD)					';
	qry += 'VALUES												';
	qry += '	((SELECT ISNULL(MAX(ID)+1,1) FROM USER_ACCOUNT),';
	qry += '@USERNAME, @EMAIL, @PASSWORD)						';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('USERNAME', db.getInput('varchar', '24'));
		ps.input('EMAIL', db.getInput('varchar', '254'));
		ps.input('PASSWORD', db.getInput('varchar', '24'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao Cadastrar');
				return;
			}
			console.log(affected);
			callback(false, 'Cadastrado com Sucesso');
		});
	});
};

exports.verifyUser = (params, callback) => {
	const param = {
		USERNAME: params.newObject.userName,
		EMAIL: params.newObject.email,
	};
	let qry = '';
	qry += 'SELECT									 ';
	qry += '	USERNAME, EMAIL						 ';
	qry += 'FROM									 ';
	qry += '	USER_ACCOUNT						 ';
	qry += 'WHERE									 ';
	qry += '	USERNAME = @USERNAME OR EMAIL= @EMAIL';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('USERNAME', db.getInput('varchar', '24'));
		ps.input('EMAIL', db.getInput('varchar', '254'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao Cadastrar');
				return;
			}

			if (recordset.recordset.length > 0) {
				dbConn.close();
				callback(true, 'Usuário já cadastrado');
				return;
			}

			callback(false, '', 0, recordset.recordset[0]);
		});
	});
};
