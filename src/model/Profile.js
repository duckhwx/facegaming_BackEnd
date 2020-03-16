const db = require('../../banco/Sql');

exports.updateProfile = (params, callback) => {
	const param = {
		USERNAME: params.user,
		EMAIL: params.email,
		NAME: params.name,
		LASTNAME: params.lastName,
		COUNTRY: params.country,
		ID: params.id,
	};

	let qry = '';
	qry = 'UPDATE									';
	qry += '	USER_ACCOUNT SET					';
	qry += 'USERNAME = @USERNAME,					';
	qry += '	EMAIL = @EMAIL,						';
	qry += 'NAME = @NAME,							';
	qry += '	LASTNAME = @LASTNAME,				';
	qry += 'COUNTRY = @COUNTRY						';
	qry += '	WHERE ID = @ID 						';

	db.connect((dbConn, ps, err) => {
		if (err) {
			dbConn.close();
			callback(true, err);
			return;
		}

		ps.input('USERNAME', db.getInput('varchar', '24'));
		ps.input('EMAIL', db.getInput('varchar', '254'));
		ps.input('NAME', db.getInput('varchar', '24'));
		ps.input('LASTNAME', db.getInput('varchar', '24'));
		ps.input('COUNTRY', db.getInput('varchar', '60'));
		ps.input('ID', db.getInput('int', '11'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao Atualizar Dados');
				return;
			}

			callback(false, 'Atualização de Dados com Sucesso');
		});
	});
};

exports.setProfileImage = (params, callback) => {
	const param = {
		ID: params.userId,
		FILENAME: params.fileName,
	};
	let qry = '';
	qry += 'SELECT											';
	qry += '	PROFILE_IMAGE.ID							';
	qry += 'FROM											';
	qry += '	PROFILE_IMAGE								';
	qry += 'WHERE											';
	qry += `	PROFILE_IMAGE.USER_ID = ${params.userId}	`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		db.quickExecute(qry, (error, quickRecordset, rowsAffected) => {
			if (error) {
				callback(true, '');
				return;
			}

			if (quickRecordset.rowsAffected > 0) {
				qry = 'UPDATE										';
				qry += '	PROFILE_IMAGE							';
				qry += 'SET											';
				qry += '	PROFILE_IMAGE.FILE_NAME = @FILENAME		';
				qry += 'WHERE PROFILE_IMAGE.USER_ID = @ID			';
			}

			if (quickRecordset.rowsAffected < 1) {
				qry = 'INSERT									  	 		  ';
				qry += '	INTO									  		  ';
				qry += 'PROFILE_IMAGE								  		  ';
				qry += '	(ID, USER_ID, FILE_NAME)				  		  ';
				qry += 'VALUES									  	  		  ';
				qry += '	((SELECT ISNULL(MAX(Id)+1,1) FROM PROFILE_IMAGE), ';
				qry += '@ID, @FILENAME)						  		  		  ';
			}

			ps.input('ID', db.getInput('int'));
			ps.input('FILENAME', db.getInput('varchar', '64'));

			db.execute(ps, qry, param, (recordset, affected, errExec) => {
				if (errExec) {
					dbConn.close();
					callback(true, 'Erro ao alterar a imagem de perfil');
					return;
				}

				callback(false, 'Imagem de perfil Alterada', affected, recordset);
			});
		});
	});
};

exports.setBackgroundImage = (params, callback) => {
	const param = {
		ID: params.userId,
		FILENAME: params.fileName,
	};
	let qry = '';
	qry += 'SELECT												';
	qry += '	PROFILE_BACKGROUND.ID							';
	qry += 'FROM												';
	qry += '	PROFILE_BACKGROUND								';
	qry += 'WHERE												';
	qry += `	PROFILE_BACKGROUND.USER_ID = ${params.userId}	`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		db.quickExecute(qry, (error, quickRecordset, rowsAffected) => {
			if (error) {
				callback(true, '');
				return;
			}

			if (quickRecordset.rowsAffected > 0) {
				qry = 'UPDATE												';
				qry += '	PROFILE_BACKGROUND								';
				qry += 'SET													';
				qry += '	PROFILE_BACKGROUND.FILE_NAME = @FILENAME		';
				qry += 'WHERE PROFILE_BACKGROUND.USER_ID = @ID				';
			}

			if (quickRecordset.rowsAffected < 1) {
				qry = 'INSERT									  	 		  		';
				qry += '	INTO									  		  		';
				qry += 'PROFILE_BACKGROUND								  		  	';
				qry += '	(ID, USER_ID, FILE_NAME)				  		  		';
				qry += 'VALUES									  	  		  		';
				qry += '	((SELECT ISNULL(MAX(Id)+1,1) FROM PROFILE_BACKGROUND), ';
				qry += '@ID, @FILENAME)						  		  		  		';
			}
			ps.input('ID', db.getInput('int'));
			ps.input('FILENAME', db.getInput('varchar', '64'));

			db.execute(ps, qry, param, (recordset, affected, errExec) => {
				if (errExec) {
					dbConn.close();
					callback(true, 'Erro ao alterar a imagem de Capa');
					return;
				}

				callback(false, 'Imagem de capa Alterada', affected, recordset);
			});
		});
	});
};

exports.getProfileData = (params, callback) => {
	const param = {
		USER_ID: params.userID,
	};

	let qry = '';
	qry += 'SELECT TOP 1								   				';
	qry += '	PROFILE_IMAGE.ID AS PROF_ID,   							';
	qry += 'PROFILE_IMAGE.FILE_NAME AS PROF_IMG,						';
	qry += '	PROFILE_BACKGROUND.ID AS BACK_ID,						';
	qry += 'PROFILE_BACKGROUND.FILE_NAME AS BACK_IMG,					';
	qry += '	PROFILE_IMAGE.USER_ID,									';
	qry += 'USER_ACCOUNT.USERNAME										';
	qry += '	FROM PROFILE_IMAGE						   				';
	qry += 'INNER JOIN USER_ACCOUNT						   				';
	qry += '	ON PROFILE_IMAGE.USER_ID = USER_ACCOUNT.ID 				';
	qry += 'LEFT JOIN PROFILE_BACKGROUND								';
	qry += '	ON PROFILE_IMAGE.USER_ID = PROFILE_BACKGROUND.USER_ID	';
	qry += 'WHERE PROFILE_IMAGE.USER_ID = @USER_ID		   				';
	qry += '	ORDER BY PROFILE_IMAGE.ID DESC			   				';

	db.connect((dbConn, ps, err) => {
		if (err) {
			dbConn.close();
			callback(true, err);
			return;
		}

		ps.input('USER_ID', db.getInput('int'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao coletar os dados do perfil');
				return;
			}

			if (recordset.rowsAffected < 1) {
				dbConn.close();
				callback(true, 'Usuário sem Imagem');
				return;
			}

			callback(false, '', affected, recordset.recordset[0]);
		});
	});
};
