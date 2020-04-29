const db = require('../../banco/Sql');
const Utils = require('../../utils/utils');

exports.createPub = (params, callback) => {
	const param = {
		USER_ID: params.id,
		TEXTFIELD: params.textfield,
		DATA_PUBLICATION: params.dateTime,
	};

	let qry = 'INSERT                                          ';
	qry += 'INTO                                               ';
	qry += '    PUBLICATION                                    ';
	qry += '(ID, TITLE, DATE_PUBLICATION, USER_ID) ';
	qry += '	VALUES                                         ';
	qry += '((SELECT ISNULL(MAX(Id)+1,1) FROM PUBLICATION),    ';
	qry += `	@TEXTFIELD, '${params.dateTime}', @USER_ID) `;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('TEXTFIELD', db.getInput('varchar', '500'));
		ps.input('USER_ID', db.getInput('int', '11'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao publicar');
				return;
			}

			let qryId = 'SELECT		  ';
			qryId += '	TOP 1 ID	  ';
			qryId += 'FROM			  ';
			qryId += '	PUBLICATION   ';
			qryId += 'ORDER BY ID DESC';

			db.quickExecute(qryId, (errSelect, rest, row) => {
				if (errSelect) {
					callback(true, 'Erro ao publicar');
					dbConn.close();
					return;
				}

				callback(false, 'Publicação cadastrada', row, rest.recordset[0]);
			});
		});
	});
};

exports.getPublications = (params, callback) => {
	const param = {
		USER_ID: params.id,
		USERS_IDS: params.usersId,
		START: params.start,
	};

	let qry = '';
	qry += 'SELECT																   	';
	qry += '	PUBLICATION.ID, PUBLICATION.TITLE,		   						   	';
	qry += 'PUBLICATION.DATE_PUBLICATION, PUBLICATION.USER_ID,				   		';
	qry += '	USER_ACCOUNT.NAME AS USERNAME, 										';
	qry += 'PROFILE_IMAGE.FILE_NAME, PROFILE_IMAGE.FILE_TYPE						';
	qry += '	FROM															   	';
	qry += 'PUBLICATION															   	';
	qry += '	INNER JOIN USER_ACCOUNT ON (USER_ACCOUNT.ID = PUBLICATION.USER_ID) 	';
	qry += 'LEFT JOIN PROFILE_IMAGE ON (USER_ACCOUNT.ID = PROFILE_IMAGE.USER_ID)	';
	qry += '	WHERE																';
	qry += 'PUBLICATION.USER_ID = @USER_ID											';
	if (params.usersId.length > 1) {
		qry += 'OR PUBLICATION.USER_ID IN (@USERS_IDS)								';
	}
	qry += '	ORDER BY DATE_PUBLICATION DESC									   	';
	qry += 'OFFSET @START ROWS													   	';
	qry += '	FETCH NEXT 10 ROWS ONLY											   	';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('USER_ID', db.getInput('int'));
		if (params.usersId.length > 1) {
			ps.input('USERS_IDS', db.getInput('int'));
		}
		ps.input('START', db.getInput('int'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec || recordset.rowsAffected <= 0) {
				dbConn.close();
				callback(true, 'Nenhuma publicação encontrada', 0, '');
				return;
			}

			callback(false, '', affected, recordset.recordset);
		});
	});
};

exports.getPublication = (params, callback) => {
	const param = {
		PUB_ID: params,
	};

	let qry = '';
	qry += 'SELECT										';
	qry += '	ID, TITLE, DATE_PUBLICATION, USER_ID	';
	qry += 'FROM										';
	qry += '	PUBLICATION								';
	qry += 'WHERE										';
	qry += '	PUBLICATION.ID = @PUB_ID				';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('PUB_ID', db.getInput('int'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec || recordset.rowsAffected < 1) {
				dbConn.close();
				callback(true, 'Houve um erro ao coletar os dados da publicação');
				return;
			}

			callback(false, '', affected, recordset.recordset[0]);
		});
	});
};

exports.insertFile = (params, id, callback) => {
	const param = {
		PUB_ID: id,
		FILE_NAME: params.filename,
		FILE_TYPE: params.mimetype,
	};

	let qry = 'INSERT								 												 				';
	qry += 'INTO																				 	 				';
	qry += '	FILE_PUB								 												 			';
	qry += '(ID, PUBLICATION_ID, FILE_NAME, FILE_TYPE)			 												 	';
	qry += '	VALUES								 																';
	qry += '((SELECT ISNULL(MAX(Id)+1,1) FROM FILE_PUB),															';
	qry += '	@PUB_ID, 																							';
	qry += '@FILE_NAME, 													 										';
	qry += '	@FILE_TYPE)																							';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('PUB_ID', db.getInput('int'));
		ps.input('FILE_NAME', db.getInput('varchar', '255'));
		ps.input('FILE_TYPE', db.getInput('varchar', '24'));

		db.execute(ps, qry, param, async (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				await Utils.deleteFileIncertions(params.pubId);
				callback(true, 'Erro ao publicar');
			}

			callback(false, 'Publicação cadastrada');
		});
	});
};

exports.getFiles = (params, callback) => {
	let qry = 'SELECT					  		  			';
	qry += '	ID, PUBLICATION_ID, FILE_NAME, FILE_TYPE	';
	qry += 'FROM						  		  			';
	qry += '	FILE_PUB					  		  		';
	qry += 'WHERE						  		  			';
	qry += `	PUBLICATION_ID IN (${params})  				`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, '');
				return;
			}

			callback(false, '', affected, recordset);
		});
	});
};

exports.deleteFile = (params, callback) => {
	const param = {
		IDS: params,
	};

	let qry = '';
	qry += 'DELETE							';
	qry += '	FROM						';
	qry += 'FILE_PUB						';
	qry += '	WHERE						';
	qry += `ID IN (${params})				`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Houve um erro ao atualizar os arquivos');
				return;
			}
			callback(false, '', affected, recordset);
		});
	});
};

exports.updatePubText = (params, callback) => {
	const param = {
		PUB_ID: params.pubId,
		TEXTFIELD: params.textfield,
	};
	let qry = '';
	qry += 'UPDATE									';
	qry += '	PUBLICATION SET						';
	qry += 'TITLE = @TEXTFIELD						';
	qry += '	WHERE ID = @PUB_ID					';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('TEXTFIELD', db.getInput('varchar', '500'));
		ps.input('PUB_ID', db.getInput('int'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao atualizar Publicação');
				return;
			}

			callback(false, 'Publicação Atualizada');
		});
	});
};

exports.deletePublication = (params, callback) => {
	const param = {
		PUB_ID: params,
	};
	let qry = '';
	qry += 'DELETE			';
	qry += '	FROM		';
	qry += 'PUBLICATION		';
	qry += '	WHERE		';
	qry += 'ID = @PUB_ID	';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('PUB_ID', db.getInput('int'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Houve um erro ao excluir a publicação');
				return;
			}

			callback(false, 'deu bom tecjonson');
		});
	});
};

exports.deleteAllFiles = (params, callback) => {
	const param = {
		PUB_ID: params,
	};
	let qry = '';
	qry += 'DELETE						';
	qry += '	FROM					';
	qry += 'FILE_PUB					';
	qry += '	WHERE					';
	qry += 'PUBLICATION_ID = @PUB_ID	';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('PUB_ID', db.getInput('int'));

		db.execute(ps, qry, param, (recordsetFile, affectedFile, errExecFile) => {
			if (errExecFile) {
				dbConn.close();
				callback(true, 'Houve um erro ao excluir a publicação');
				return;
			}

			callback(false, 'Publicação excluida', recordsetFile.rowsAffected, recordsetFile.recordset);
		});
	});
};
