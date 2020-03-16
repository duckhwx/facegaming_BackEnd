const express = require('express');
const moment = require('moment');
const Friends = require('../model/Friends');
const utils = require('../../utils/utils');

const router = express.Router();

router.get('/selectFriends',(req, res) =>{
    let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
    };

    const { token } = req.headers;
    const { userData } = utils.decodeJwt(token);
    
    const params = {
		id: userData.ID,
		usersId: [],
    };
    Friends.updateFriends(params, (status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
        };
        //	console.log(response);
		res.send(response);
	});
})

router.get('/listFriendss', (req, res) =>{
	let response = {
		error: false,
		message: '',
		total: 1,
		data: '',
    };

    const { token } = req.headers;
    const { userData } = utils.decodeJwt(token);
    
    const params = {
		id: userData.ID,
		usersId: [],
	};
	
	Friends.listFriends(params,(status, responseMessage, totalRecords, result) => {
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};
		//	console.log(response);
		res.send(response);	
	})
});

router.put('/acceptFriends',(req, res) =>{
	let response = {
		error: false,
		message:'',
		total: 1,
		data:'',
	};

	const params = req.body;
	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	Friends.acceptFriends(params, userData, (status, responseMessage, totalRecords, result ) =>{
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};
		res.send(response);
	});
});

router.put('/cancelFriends',(req, res) =>{
	let response = {
		error: false,
		message:'',
		total: 1,
		data:'',
	};

	const params = req.body;
	const { token } = req.headers;
	const { userData } = utils.decodeJwt(token);

	Friends.cancelFriends(params, userData, (status, responseMessage, totalRecords, result ) =>{
		response = {
			error: status,
			message: responseMessage,
			total: totalRecords,
			data: result,
		};
		res.send(response);
	});
});

module.exports = router;