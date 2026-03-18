(function () {
  const socket = io('/terminal');
  const terminal = document.getElementById('terminal');
  const outputEl = document.getElementById('output');
  const inputEl = document.getElementById('command-input');
  const promptEl = document.getElementById('prompt');
  const inputLine = document.getElementById('input-line');
  const connStatus = document.getElementById('connection-status');
  const cursorBlock = document.querySelector('.cursor-block');
  const titleText = document.querySelector('.titlebar-text');

  let commandHistory = [];
  let historyIndex = -1;
  let passwordMode = false;
  let isProcessing = false;
  let sessionId = null;

  socket.on('connect', () => {
    updateConnStatus('connected', '✓', 'SSH session established');
    setTimeout(() => connStatus.classList.add('hidden'), 3000);
  });

  socket.on('disconnect', () => {
    updateConnStatus('error', '✕', 'Connection lost');
    connStatus.classList.remove('hidden');
  });

  socket.on('session-id', (id) => { sessionId = id; });

  socket.on('output', (data) => {
    isProcessing = false;

    if (data.includes('Broadcast message')) {
      appendOutput(data, 'wall-message');
    } else if (data.includes('command not found') || data.includes('Permission denied') ||
               data.includes('No such file') || data.includes('error:') || data.includes('Error')) {
      appendOutput(data, 'error');
    } else {
      appendOutput(data, '');
    }

    scrollToBottom();
  });

  socket.on('prompt', (prompt) => {
    promptEl.textContent = prompt;
    inputEl.disabled = false;
    inputEl.focus();
    passwordMode = false;
    inputLine.classList.remove('password-mode');
    updateCursorPosition();

    const cwdMatch = prompt.match(/:(.+)\$/);
    if (cwdMatch) titleText.textContent = `admin@prod-srv-01: ${cwdMatch[1]}`;
  });

  socket.on('password-prompt', (isPassword) => {
    passwordMode = true;
    inputLine.classList.add('password-mode');
    inputEl.value = '';
    inputEl.disabled = false;
    inputEl.focus();
    updateCursorPosition();
  });

  socket.on('disconnected', () => {
    appendOutput('\nConnection to prod-srv-01 closed.\n', '');
    inputEl.disabled = true;
    updateConnStatus('error', '✕', 'Session terminated');
    connStatus.classList.remove('hidden');
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const cmd = inputEl.value;

      if (!passwordMode) {
        const cmdLineDiv = document.createElement('div');
        cmdLineDiv.className = 'cmd-line';
        cmdLineDiv.innerHTML = `<span class="prompt-echo">${escapeHtml(promptEl.textContent)}</span><span class="cmd-echo">${escapeHtml(cmd)}</span>`;
        outputEl.appendChild(cmdLineDiv);

        if (cmd.trim()) {
          commandHistory.push(cmd);
          historyIndex = commandHistory.length;
        }
      } else {
        const cmdLineDiv = document.createElement('div');
        cmdLineDiv.className = 'cmd-line';
        cmdLineDiv.innerHTML = `<span class="prompt-echo">${escapeHtml(promptEl.textContent)}</span><span class="cmd-echo">••••••••</span>`;
        outputEl.appendChild(cmdLineDiv);
      }

      inputEl.value = '';
      updateCursorPosition();
      isProcessing = true;

      showTypingIndicator();

      socket.emit('command', cmd);
      scrollToBottom();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        inputEl.value = commandHistory[historyIndex];
        updateCursorPosition();
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        inputEl.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        inputEl.value = '';
      }
      updateCursorPosition();
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      if (inputEl.value.length > 0) {
        inputEl.value += '  ';
        updateCursorPosition();
      }
    }

    if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      const cmdLineDiv = document.createElement('div');
      cmdLineDiv.className = 'cmd-line';
      cmdLineDiv.innerHTML = `<span class="prompt-echo">${escapeHtml(promptEl.textContent)}</span><span class="cmd-echo">${escapeHtml(inputEl.value)}^C</span>`;
      outputEl.appendChild(cmdLineDiv);
      inputEl.value = '';
      removeTypingIndicator();
      updateCursorPosition();
      scrollToBottom();
    }

    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      outputEl.innerHTML = '';
      scrollToBottom();
    }
  });

  inputEl.addEventListener('input', () => { updateCursorPosition(); });

  terminal.addEventListener('click', () => { inputEl.focus(); });

  function appendOutput(text, className) {
    removeTypingIndicator();
    const div = document.createElement('div');
    div.className = `cmd-output ${className}`;

    let html = escapeHtml(text);
    html = html.replace(/\x1b\[1;34m(.*?)\x1b\[0m/g, '<span style="color:#4fc1ff;font-weight:bold">$1</span>');
    html = html.replace(/\x1b\[1;32m(.*?)\x1b\[0m/g, '<span style="color:#28c840;font-weight:bold">$1</span>');
    html = html.replace(/\x1b\[1;36m(.*?)\x1b\[0m/g, '<span style="color:#00d4ff;font-weight:bold">$1</span>');
    html = html.replace(/\x1b\[31m(.*?)\x1b\[0m/g, '<span style="color:#ff3333">$1</span>');
    html = html.replace(/\x1b\[32m(.*?)\x1b\[0m/g, '<span style="color:#28c840">$1</span>');
    html = html.replace(/\x1b\[33m(.*?)\x1b\[0m/g, '<span style="color:#ffb000">$1</span>');
    html = html.replace(/\x1b\[2J\x1b\[H/g, '');

    div.innerHTML = html;
    outputEl.appendChild(div);
  }

  function showTypingIndicator() {
    removeTypingIndicator();
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = '<span></span><span></span><span></span>';
    outputEl.appendChild(indicator);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const existing = document.getElementById('typing-indicator');
    if (existing) existing.remove();
  }

  function updateCursorPosition() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = getComputedStyle(inputEl).font;
    const textWidth = ctx.measureText(inputEl.value).width;
    cursorBlock.style.left = textWidth + 'px';
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  function scrollToBottom() {
    terminal.scrollTop = terminal.scrollHeight;
  }

  function updateConnStatus(type, icon, text) {
    connStatus.className = `connection-status ${type}`;
    connStatus.querySelector('.conn-icon').textContent = icon;
    connStatus.querySelector('.conn-text').textContent = text;
  }

  setTimeout(() => { inputEl.focus(); }, 500);
})();
