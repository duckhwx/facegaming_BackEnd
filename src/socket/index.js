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

		socket.on('inviteUser', (userId) => {
			Socket.getSocketData(userId, (response) => {
				if (response.total < 1) {
					return;
				}

				// eslint-disable-next-line no-prototype-builtins
				if (connectedUsers.hasOwnProperty(response.data.SOCKET_ID)) {
					connectedUsers[response.data.SOCKET_ID].emit('inviteUser');
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
