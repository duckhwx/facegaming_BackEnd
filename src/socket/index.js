/* eslint-disable no-prototype-builtins */
const Socket = require('../controller/Socket');

module.exports = (io) => {
	const connectedUsers = {};

	io.on('connection', (socket) => {
		connectedUsers[socket.id] = socket;
		console.log(socket.id);

		socket.on('register', (token) => {
			const params = {
				token,
				socketId: socket.id,
			};

			Socket.setSocket(params, (response) => {
				socket.emit('register', response);
			});
		});

		socket.on('inviteUser', (object) => {
			Socket.getSocketData(object.socketUserId, (response) => {
				if (response.total < 1) {
					return;
				}

				if (connectedUsers.hasOwnProperty(response.data.SOCKET_ID)) {
					connectedUsers[response.data.SOCKET_ID].emit('inviteUser', object.userSenderId);
				}
			});
		});

		socket.on('inviteResponse', (object) => {
			Socket.getSocketData(object.socketUserId, (response) => {
				if (response.total < 1) {
					return;
				}

				if (connectedUsers.hasOwnProperty(response.data.SOCKET_ID)) {
					connectedUsers[response.data.SOCKET_ID].emit('inviteResponse', object);
				}
			});
		});

		socket.on('deleteFriend', (object) => {
			Socket.getSocketData(object.socketUserId, (response) => {
				if (response.total < 1) {
					return;
				}

				if (connectedUsers.hasOwnProperty(response.data.SOCKET_ID)) {
					console.log(connectedUsers[response.data.SOCKET_ID]);
					connectedUsers[response.data.SOCKET_ID].emit('deleteFriend', object);
				}
			});
		});

		socket.on('disconnect', () => {
			delete connectedUsers[socket.id];
			const params = {
				socketId: socket.id,
			};

			Socket.unsetSocket(params, (response) => {
			});
		});

		console.log('Usuário conectado');
	});
};
