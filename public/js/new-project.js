// New project page logic.
// Sends form data with optional uploaded plan file.

const formEl = document.getElementById('newProjectForm');
const statusEl = document.getElementById('status');

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusEl.className = 'muted';
  statusEl.textContent = 'Creating project...';

  try {
    const formData = new FormData(formEl);

    const response = await fetch('/api/projects', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to create project.');
    }

    statusEl.className = 'success';
    statusEl.textContent = 'Project created. Redirecting to assumptions...';

    window.location.href = `/assumptions.html?projectId=${data.id}`;
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = error.message;
  }
});
