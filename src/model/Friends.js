const db = require('../../banco/Sql');

exports.updateFriends = (params, callback) => {
	//Lista amigos pendentes
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
		qry += `	F.REQUEST_STATUS = 'P';									`;

		db.connect((dbConn, ps, err) =>{
			if (err) {
				dbConn.close();
				callback(true, err);
				return;
			}
			db.execute(ps, qry, null,(recordset, affected, errExec) =>{
				const data = recordset;

				if(errExec){
					dbConn.close();
					callback(true,'Erro ao tentar alguma coisa, contate o TI');
					return;
				}
				callback(false,'Dados atualizados com sucessso!', null, data.recordset);
			})
		})
}

exports.listFriends = (params, callback) => {
	//Lista amigos aceitos
		let qry = '';
		qry += 'SELECT														 		'
		qry += '	U.USERNAME AS USERNAME,							'
		qry += '	U.ID AS ID,													'
		qry += '	U.NAME AS NAME,											'
		qry += '	U.LASTNAME AS LASTN FROM FRIENDS F	'
		qry += 'INNER JOIN											 			'
		qry += '	USER_ACCOUNT U ON F.USER_ID2 = U.ID	'
		qry += 'WHERE																	'
		qry += `	F.USER_ID1 = ${params.id}						`
		qry += 'AND																		'
		qry += `	F.USER_ID2 != ${params.id}					`
		qry += 'AND																		'
		qry += `	F.REQUEST_STATUS = 'A';							`

		db.connect((dbConn, ps, err) =>{
			if (err) {
				dbConn.close();
				callback(true, err);
				return;
			}
			db.execute(ps, qry, null,(recordset, affected, errExec) =>{
				const data = recordset;

				if(errExec){
					dbConn.close();
					callback(true,'Erro ao tentar alguma coisa, contate o TI');
					return;
				}
				callback(false,'Dados atualizados com sucessso2!', null, data.recordset);
			})
		})	
}

exports.acceptFriends = (params, userData ,callback) => {
	//let qry = '';
	//qry += 'INSERT INTO												 						'
	//qry += 'FRIENDS																				'
	//qry += '	(ID ,USER_ID1, USER_ID2, REQUEST_STATUS)		'
	//qry += 'VALUES														 						'
	//qry += '	((SELECT ISNULL(MAX(Id)+1,1) FROM FRIENDS),	'
	//qry += `	${userData.ID}, ${params.friendId}, 'A');		`

	////

	let qry = '';
	qry += 'UPDATE											 		';
	qry += '	FRIENDS												';
	qry += 'SET 								 						';
	qry += `	REQUEST_STATUS = 'A'					`;
	qry += 'WHERE 												 	';
	qry += `	USER_ID2 = ${params.friendId}	`;
	
	db.connect((dbConn, ps, err) =>{
		if (err) {
			dbConn.close();
			callback(true, err);
			return;
		}
			console.log(qry);
		db.execute(ps, qry, null,(recordset, affected, errExec) =>{
			const data = recordset;

			if(errExec){
				dbConn.close();
				callback(true,'Erro ao tentar alguma coisa, contate o TI');
				return;
			}
			callback(false,'Dados atualizados com sucessso!', null, data.recordset);
		})
	})
}

exports.cancelFriends = (params, userData, callback) => {
	let qry = '';
	qry += 'UPDATE											 		';
	qry += '	FRIENDS												';
	qry += 'SET 								 						';
	qry += `	REQUEST_STATUS = 'C'					`;
	qry += 'WHERE 												 	';
	qry += `	USER_ID2 = ${params.friendId}	`;
	console.log(qry);

	db.connect((dbConn, ps, err) =>{
		if (err) {
			dbConn.close();
			callback(true, err);
			return;
		}
			console.log(qry);
		db.execute(ps, qry, null,(recordset, affected, errExec) =>{
			const data = recordset;

			if(errExec){
				dbConn.close();
				callback(true,'Erro ao tentar alguma coisa, contate o TI');
				return;
			}
			callback(false,'Dados atualizados com sucessso!', null, data.recordset);
		})
	})
}
