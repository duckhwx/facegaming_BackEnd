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
			dbConn.close();
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

exports.getFriends = (params, callback) => {
	const param = {
		ID: params.id,
	};
	let qry = 'SELECT						';
	qry += '	ID, USER_ID1, USER_ID2		';
	qry += 'FROM FRIENDS					';
	qry += '	WHERE						';
	qry += 'USER_ID1 = @ID OR USER_ID2 = @ID';

	db.connect((dbConn, ps, err) => {
		if (err) {
			dbConn.close();
			callback(true, err);
			return;
		}

		ps.input('ID', db.getInput('int', '11'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Voce nao tem amigos');
				return;
			}
			callback(false, '', affected, recordset);
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
	qry += ' SELECT																   		';
	qry += '	PUBLICATION.ID, PUBLICATION.TITLE,		   						   		';
	qry += ' 	PUBLICATION.DATE_PUBLICATION, PUBLICATION.USER_ID,				   		';
	qry += 'USER_ACCOUNT.USERNAME, PROFILE_IMAGE.FILE_NAME						   		';
	qry += '	FROM															   		';
	qry += 'PUBLICATION															   		';
	qry += '	INNER JOIN USER_ACCOUNT ON (USER_ACCOUNT.ID = PUBLICATION.USER_ID) 		';
	qry += '	INNER JOIN PROFILE_IMAGE ON (USER_ACCOUNT.ID = PROFILE_IMAGE.USER_ID)	';
	qry += 'WHERE																   		';
	qry += '	PUBLICATION.USER_ID = @USER_ID											';
	if (params.usersId.length > 1) {
		qry += 'OR PUBLICATION.USER_ID IN (@USERS_IDS)									';
	}
	qry += '	ORDER BY DATE_PUBLICATION DESC									   		';
	qry += 'OFFSET @start ROWS													   		';
	qry += '	FETCH NEXT 10 ROWS ONLY											   		';

	db.connect((dbConn, ps, err) => {
		if (err) {
			dbConn.close();
			callback(true, err);
			return;
		}

		ps.input('USER_ID', db.getInput('int'));
		if (params.usersId.length > 1) {
			ps.input('USERS_IDS', db.getInput('int'));
		}
		ps.input('START', db.getInput('int'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			console.log(param);
			if (errExec || recordset.rowsAffected <= 0) {
				dbConn.close();
				callback(true, 'Nenhuma publicação encontrada', 0, '');
				return;
			}

			callback(false, '', affected, recordset.recordset);
		});
	});
};

exports.insertFile = (params, id, callback) => {
	const param = {
		PUB_ID: id,
		FILE_NAME: params.filename,
	};
	let qry = 'INSERT								 												 				';
	qry += 'INTO																				 	 				';
	qry += '	FILES								 												 				';
	qry += '(ID, PUBLICATION_ID, FILE_NAME)			 												 				';
	qry += '	VALUES								 																';
	qry += '((SELECT ISNULL(MAX(Id)+1,1) FROM FILES),																';
	qry += '	@PUB_ID, 																							';
	qry += '@FILE_NAME)													 											';

	db.connect((dbConn, ps, err) => {
		if (err) {
			dbConn.close();
			callback(true, err);
			return;
		}

		ps.input('PUB_ID', db.getInput('int'));
		ps.input('FILE_NAME', db.getInput('varchar', '255'));

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
	const param = {
		IDS: params,
	};

	let qry = 'SELECT					  		  ';
	qry += '	ID, PUBLICATION_ID, FILE_NAME	  ';
	qry += 'FROM						  		  ';
	qry += '	FILES					  		  ';
	qry += 'WHERE						  		  ';
	qry += `	PUBLICATION_ID IN (${param.IDS})  `;

	db.connect((dbConn, ps, err) => {
		if (err) {
			dbConn.close();
			callback(true, err);
			return;
		}

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, '');
				return;
			}
			callback(false, '', affected, recordset.recordset);
		});
	});
};

exports.updatePub = (params, callback) => {
	const param = {
		TEXTFIELD: params.textfield,
		PUB_ID: params.pubID,
	};
	let qry = '';
	qry += 'UPDATE									';
	qry += '	PUBLICATION SET						';
	qry += 'TITLE = @TEXTFIELD						';
	qry += '	WHERE ID = @PUB_ID					';

	db.connect((dbConn, ps, err) => {
		if (err) {
			dbConn.close();
			callback(true, err);
			return;
		}

		ps.input('TEXTFIELD', db.getInput('varchar', '500'));
		ps.input('PUB_ID', db.getInput('int'));

		db.execute(ps, qry, param, (recordset, affected, errExec) => {
			console.log(errExec);
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao atualizar Publicação');
				return;
			}

			callback(false, 'Publicação Atualizada');
		});
	});
};
