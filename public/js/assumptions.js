// Assumptions page logic.
// Loads current assumptions and saves updates for a project.

const projectId = getQueryParam('projectId');
const projectInfoEl = document.getElementById('projectInfo');
const formEl = document.getElementById('assumptionsForm');
const statusEl = document.getElementById('status');
const saveAndGenerateBtn = document.getElementById('saveAndGenerateBtn');

if (!projectId) {
  projectInfoEl.className = 'error';
  projectInfoEl.textContent = 'Missing projectId in URL.';
  formEl.style.display = 'none';
}

async function loadProject() {
  if (!projectId) {
    return;
  }

  try {
    const project = await apiFetch(`/api/projects/${projectId}`);

    projectInfoEl.textContent = `Project: ${project.projectName} (${project.clientName})`;

    if (project.assumptions) {
      // Pre-fill existing assumptions for easy edits.
      for (const [key, value] of Object.entries(project.assumptions)) {
        if (formEl.elements[key]) {
          formEl.elements[key].value = value;
        }
      }
    }
  } catch (error) {
    projectInfoEl.className = 'error';
    projectInfoEl.textContent = error.message;
  }
}

function getAssumptionsPayload() {
  return {
    houseLength: formEl.houseLength.value,
    houseWidth: formEl.houseWidth.value,
    numberOfFloors: formEl.numberOfFloors.value,
    wallHeight: formEl.wallHeight.value,
    studSpacing: formEl.studSpacing.value,
    joistSpacing: formEl.joistSpacing.value,
    wasteFactor: formEl.wasteFactor.value
  };
}

async function saveAssumptions() {
  const payload = getAssumptionsPayload();

  return apiFetch(`/api/projects/${projectId}/assumptions`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  statusEl.className = 'muted';
  statusEl.textContent = 'Saving assumptions...';

  try {
    await saveAssumptions();
    statusEl.className = 'success';
    statusEl.textContent = 'Assumptions saved.';
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = error.message;
  }
});

saveAndGenerateBtn.addEventListener('click', async () => {
  statusEl.className = 'muted';
  statusEl.textContent = 'Saving assumptions and generating estimate...';

  try {
    await saveAssumptions();
    await apiFetch(`/api/estimates/${projectId}/generate`, { method: 'POST' });
    window.location.href = `/results.html?projectId=${projectId}`;
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = error.message;
  }
});

loadProject();
