export function connectToServer(showConnection) {
  if (typeof window.io !== 'function') {
    showConnection('disconnected', 'Connection unavailable');
    return;
  }
  // A reload creates a fresh socket; match restoration is not implemented.
  const socket = window.io({ reconnection: false, timeout: 10000 });
  socket.on('server:status', (payload) => {
    if (payload && typeof payload === 'object' && !Array.isArray(payload) && payload.status === 'connected') {
      showConnection('connected', 'Connected');
    }
  });
  socket.on('disconnect', () => showConnection('disconnected', 'Disconnected'));
  socket.on('connect_error', () => showConnection('disconnected', 'Unable to connect'));
}
