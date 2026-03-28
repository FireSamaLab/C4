// Dashboard page logic.
// Loads project list and provides quick links.

const statusEl = document.getElementById('status');
const projectListEl = document.getElementById('projectList');

async function loadProjects() {
  statusEl.textContent = 'Loading projects...';
  projectListEl.innerHTML = '';

  try {
    const projects = await apiFetch('/api/projects');

    if (!projects.length) {
      statusEl.textContent = 'No projects yet. Create your first estimate project.';
      return;
    }

    statusEl.textContent = `${projects.length} project(s) found.`;

    projectListEl.innerHTML = projects
      .map((project) => {
        const hasAssumptions = !!project.assumptions;
        const hasEstimate = !!project.estimate;

        return `
          <div class="project-row">
            <h3>${escapeHtml(project.projectName)}</h3>
            <div class="project-meta">
              Client: ${escapeHtml(project.clientName)} | Address: ${escapeHtml(project.projectAddress)}
            </div>
            <div class="project-meta">
              Type: ${escapeHtml(project.projectType)} |
              Created: ${new Date(project.createdAt).toLocaleString()}
            </div>
            <div class="actions">
              <a class="button-secondary" href="/assumptions.html?projectId=${project.id}">
                ${hasAssumptions ? 'Edit Assumptions' : 'Add Assumptions'}
              </a>
              <a class="button-secondary" href="/results.html?projectId=${project.id}">
                ${hasEstimate ? 'View Results' : 'Generate Results'}
              </a>
            </div>
          </div>
        `;
      })
      .join('');
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = error.message;
  }
}

loadProjects();
