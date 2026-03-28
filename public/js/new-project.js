// New project page logic.
// Sends form data with optional uploaded plan file.

const formEl = document.getElementById('newProjectForm');
const statusEl = document.getElementById('status');

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusEl.className = 'muted';
  statusEl.textContent = 'Création du projet...';

  try {
    const formData = new FormData(formEl);

    const response = await fetch('/api/projects', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Impossible de créer le projet.');
    }

    statusEl.className = 'success';
    statusEl.textContent = 'Projet créé. Redirection vers les hypothèses...';

    window.location.href = `/assumptions.html?projectId=${data.id}`;
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = error.message;
  }
});
