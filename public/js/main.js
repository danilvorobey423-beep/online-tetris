const connectionStatus = document.querySelector('#connection-status');
const retryConnection = document.querySelector('#retry-connection');

function showConnection(state, message) {
  connectionStatus.dataset.state = state;
  connectionStatus.textContent = message;
  retryConnection.hidden = state !== 'disconnected';
}

if (typeof io !== 'function') {
  showConnection('disconnected', 'Connection unavailable');
} else {
  // Reload starts a fresh connection; match reconnection is not implemented.
  const socket = io({ reconnection: false, timeout: 10000 });

  socket.on('server:status', (payload) => {
    if (payload && typeof payload === 'object' && payload.status === 'connected') {
      showConnection('connected', 'Connected');
    }
  });
  socket.on('disconnect', () => {
    showConnection('disconnected', 'Disconnected');
  });
  socket.on('connect_error', () => {
    showConnection('disconnected', 'Unable to connect');
  });
}
