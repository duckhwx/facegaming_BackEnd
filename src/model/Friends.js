const db = require('../../banco/Sql');

exports.updateFriends = (params, callback) => {
	// Lista amigos pendentes
	let qry = '';
	qry += 'SELECT														 				';
	qry += '	U.USERNAME AS USERNAME,									';
	qry += '	U.ID AS ID,															';
	qry += '	U.NAME AS NAME,													';
	qry += '	U.LASTNAME AS LASTN 										';
	qry += 'FROM 															 				';
	qry += '	USER_ACCOUNT U									 				';
	qry += 'INNER JOIN												 				';
	qry += '	FRIENDS F ON										 				';
	qry += '	U.ID = F.USER_ID2								 				';
	qry += 'AND															 					';
	qry += '	F.REQUEST_STATUS = \'P\';									';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}
		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			const data = recordset;

			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao tentar alguma coisa, contate o TI');
				return;
			}
			callback(false, 'Dados atualizados com sucessso!', null, data.recordset);
		});
	});
};

exports.getPedingFriends = (params, callback) => {
	let qry = '';
	qry += 'SELECT														';
	qry += '	SENDER, RECEIVER, STATUS								';
	qry += 'FROM														';
	qry += '	FRIENDS													';
	qry += 'WHERE														';
	qry += `	(RECEIVER = ${params.id} OR SENDER = ${params.id}) AND	`;
	qry += 'STATUS = \'P\'												';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, '');
			return;
		}

		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao coletar os pedidos de amizades pendentes');
				return;
			}

			callback(false, '', recordset.rowsAffected, recordset.recordset);
		});
	});
};

exports.getFriendsData = (params, callback) => {
	let qry = '';
	qry += 'SELECT										';
	qry += '	USER_ACCOUNT.ID,						';
	qry += 'USER_ACCOUNT.NAME,							';
	qry += '	PROFILE_IMAGE.FILE_NAME,				';
	qry += '	PROFILE_IMAGE.FILE_TYPE					';
	qry += ' FROM										';
	qry += '	USER_ACCOUNT							';
	qry += 'LEFT JOIN									';
	qry += '	PROFILE_IMAGE ON						';
	qry += 'PROFILE_IMAGE.USER_ID = USER_ACCOUNT.ID		';
	qry += '	WHERE									';
	qry += `USER_ACCOUNT.ID IN (${params.usersId})		`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao selecionar os amigos');
				return;
			}
			callback(false, '', recordset.rowsAffected, recordset.recordset);
		});
	});
};

exports.addFriend = (params, callback) => {
	let qry = '';
	qry += 'UPDATE																	';
	qry += '	FRIENDS																';
	qry += 'SET 																	';
	qry += '	STATUS = \'A\'														';
	qry += 'WHERE 																	';
	qry += `	(SENDER = ${params.friendId} AND RECEIVER = ${params.userId})		`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Houve um erro ao adicionar um amigo');
				return;
			}
			callback(false, 'Pedido confirmado', null, recordset.recordset);
		});
	});
};

exports.verifyUser = (params, callback) => {
	const param = {
		NICKNAME: params.nickname,
	};
	let qry = '';
	qry += 'SELECT						';
	qry += '	ID						';
	qry += 'FROM						';
	qry += '	USER_ACCOUNT			';
	qry += 'WHERE						';
	qry += '	NAME = @NICKNAME		';

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		ps.input('NICKNAME', db.getInput('varchar', '24'));

		db.execute(ps, qry, param, async (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Houve um erro ao enviar a solicitação');
				return;
			}

			if (recordset.rowsAffected < 1) {
				dbConn.close();
				callback(true, 'Usuário inexistente');
				return;
			}

			callback(false, '', recordset.rowsAffected, recordset.recordset[0]);
		});
	});
};

exports.deleteFriend = (params, callback) => {
	let qry = '';
	qry += 'DELETE																';
	qry += '	FROM															';
	qry += 'FRIENDS																';
	qry += '	WHERE															';
	qry += `(SENDER = ${params.userId} AND RECEIVER = ${params.friendId}) OR	`;
	qry += `	(RECEIVER = ${params.userId} AND SENDER = ${params.friendId})	`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, '');
			return;
		}

		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			if (errExec || recordset.rowsAffected < 1) {
				dbConn.close();
				callback(true, 'Houve um erro ao excluir o amigo');
				return;
			}

			callback(false, 'Amizade desfeita', recordset.rowsAffected, recordset.recordset);
		});
	});
};

exports.inviteUser = (params, callback) => {
	let qry = '';
	qry = 'SELECT																	';
	qry += '	SENDER, RECEIVER, STATUS											';
	qry += 'FROM																	';
	qry += '	FRIENDS																';
	qry += 'WHERE																	';
	qry += `	(SENDER = ${params.sender} AND RECEIVER = ${params.receiver}) OR	`;
	qry += `(RECEIVER = ${params.sender} AND SENDER = ${params.receiver})			`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}

		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Houve um erro ao enviar a solicitação');
				return;
			}

			if (recordset.rowsAffected > 0) {
				let message = '';
				if (recordset.recordset[0].STATUS === 'P') {
					message = 'Este usuário já recebeu/enviou o pedido de amizade';
				}

				if (recordset.recordset[0].STATUS === 'A') {
					message = 'Este usuário já é seu amigo';
				}
				callback(true, message);
				return;
			}

			qry = 'INSERT															';
			qry += '	INTO														';
			qry += 'FRIENDS															';
			qry += '	(ID, SENDER, RECEIVER, STATUS)								';
			qry += 'VALUES															';
			qry += '	((SELECT ISNULL(MAX(Id)+1,1) FROM FRIENDS),					';
			qry += `${params.sender},												`;
			qry += `	${params.receiver},											`;
			qry += '\'P\')															';

			db.quickExecute(qry, (error, quickRecordset, rowsAffected) => {
				if (error) {
					callback(true, 'Houve um erro ao enviar a solicitação');
					return;
				}

				callback(false, 'Solicitação enviada', quickRecordset.rowsAffected, quickRecordset.recordset);
			});
		});
	});
};
