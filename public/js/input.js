const actions = new Map([
  ['ArrowLeft', 'left'],
  ['ArrowRight', 'right'],
  ['ArrowUp', 'rotate'],
  ['ArrowDown', 'soft-drop'],
  ['Space', 'hard-drop'],
]);

export function bindKeyboardControls(onAction, isPlaying) {
  window.addEventListener('keydown', (event) => {
    const action = actions.get(event.code);
    if (!action || !isPlaying() || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof Element && event.target.closest('button, a, input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    if (event.repeat && (action === 'rotate' || action === 'hard-drop')) return;
    onAction(action);
  });
}
