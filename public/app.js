const statusEl = document.getElementById('status');
const outputEl = document.getElementById('output');

async function callRoute(method, path) {
  statusEl.textContent = `Sending ${method} ${path} ...`;
  statusEl.className = '';
  outputEl.textContent = '';

  try {
    // relative URL: the request goes to the same server that served this page
    const res = await fetch(path, { method });

    statusEl.textContent = `${res.status} ${res.statusText}`;
    statusEl.className = res.ok ? 'ok' : 'error';

    // show JSON nicely indented, anything else as plain text
    const type = res.headers.get('Content-Type') ?? '';
    if (type.includes('application/json')) {
      const data = await res.json();
      outputEl.textContent = JSON.stringify(data, null, 2);
    } else {
      outputEl.textContent = await res.text();
    }
  } catch (err) {
    // network error (for example the server is not running): the page keeps working
    statusEl.textContent = 'Request failed';
    statusEl.className = 'error';
    outputEl.textContent = err.message;
  }
}

document.querySelectorAll('.buttons button').forEach((button) => {
  button.addEventListener('click', () => {
    callRoute(button.dataset.method, button.dataset.path);
  });
});
