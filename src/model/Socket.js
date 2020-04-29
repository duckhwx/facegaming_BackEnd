const db = require('../../banco/Sql');

exports.setSocket = (params, callback) => {
	let qry = '';
	qry += 'INSERT													';
	qry += '	INTO												';
	qry += 'USER_SESSION											';
	qry += '	(ID, SOCKET_ID, STATUS, USER_ID)					';
	qry += 'VALUES													';
	qry += '	((SELECT ISNULL(MAX(Id)+1,1) FROM USER_SESSION),	';
	qry += `'${params.socketId}', 									`;
	qry += '	\'ON\',												';
	qry += `${params.userId})										`;
	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}
		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao conectar o Socket');
				return;
			}

			callback(false, '', null, recordset);
		});
	});
};

exports.unsetSocket = (params, callback) => {
	let qry = '';
	qry += 'DELETE												';
	qry += '	FROM											';
	qry += 'USER_SESSION										';
	qry += '	WHERE											';
	qry += `SOCKET_ID = '${params.socketId}'					`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, err);
			return;
		}
		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Erro ao desconectar o Socket');
				return;
			}

			callback(false, '', null, recordset);
		});
	});
};

exports.getSocketData = (params, callback) => {
	let qry = '';
	qry += 'SELECT									';
	qry += '	SOCKET_ID							';
	qry += 'FROM									';
	qry += '	USER_SESSION						';
	qry += 'WHERE									';
	qry += `	USER_ID = ${params}					`;

	db.connect((dbConn, ps, err) => {
		if (err) {
			callback(true, '');
			return;
		}

		db.execute(ps, qry, null, (recordset, affected, errExec) => {
			if (errExec) {
				dbConn.close();
				callback(true, 'Houve um erro ao se conectar com o Socket');
				return;
			}

			callback(false, '', recordset.rowsAffected, recordset.recordset[0]);
		});
	});
};
