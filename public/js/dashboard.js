// Dashboard page logic.
// Loads project list and provides quick links.

const statusEl = document.getElementById('status');
const projectListEl = document.getElementById('projectList');

function projectTypeLabel(type) {
  if (type === 'rectangular-new-house') {
    return 'Maison neuve rectangulaire';
  }

  return type || '';
}

async function loadProjects() {
  statusEl.textContent = 'Chargement des projets...';
  projectListEl.innerHTML = '';

  try {
    const projects = await apiFetch('/api/projects');

    if (!projects.length) {
      statusEl.textContent = 'Aucun projet pour le moment. Créez votre premier projet d\'estimation.';
      return;
    }

    statusEl.textContent = `${projects.length} projet(s) trouvé(s).`;

    projectListEl.innerHTML = projects
      .map((project) => {
        const hasAssumptions = !!project.assumptions;
        const hasEstimate = !!project.estimate;

        return `
          <div class="project-row">
            <h3>${escapeHtml(project.projectName)}</h3>
            <div class="project-meta">
              Client : ${escapeHtml(project.clientName)} | Adresse : ${escapeHtml(project.projectAddress)}
            </div>
            <div class="project-meta">
              Type : ${escapeHtml(projectTypeLabel(project.projectType))} |
              Créé le : ${new Date(project.createdAt).toLocaleString('fr-CA')}
            </div>
            <div class="actions">
              <a class="button-secondary" href="/assumptions.html?projectId=${project.id}">
                ${hasAssumptions ? 'Modifier les hypothèses' : 'Ajouter des hypothèses'}
              </a>
              <a class="button-secondary" href="/results.html?projectId=${project.id}">
                ${hasEstimate ? 'Voir les résultats' : 'Générer les résultats'}
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
