// Results page logic.
// Shows estimate table and supports generate/recalculate action.

const projectId = getQueryParam('projectId');
const projectInfoEl = document.getElementById('projectInfo');
const statusEl = document.getElementById('status');
const generateBtn = document.getElementById('generateBtn');
const assumptionsLink = document.getElementById('assumptionsLink');
const resultsBody = document.getElementById('resultsBody');
const totalCostEl = document.getElementById('totalCost');

if (!projectId) {
  projectInfoEl.className = 'error';
  projectInfoEl.textContent = 'projectId manquant dans l\'URL.';
  generateBtn.disabled = true;
}

assumptionsLink.href = `/assumptions.html?projectId=${projectId || ''}`;

function renderEstimate(estimate) {
  if (!estimate || !estimate.items || !estimate.items.length) {
    resultsBody.innerHTML = '';
    totalCostEl.textContent = 'Coût total : $0.00';
    return;
  }

  resultsBody.innerHTML = estimate.items
    .map((row) => {
      return `
        <tr>
          <td>${escapeHtml(row.item)}</td>
          <td>${row.quantity}</td>
          <td>${formatMoney(row.unitPrice)}</td>
          <td>${formatMoney(row.subtotal)}</td>
        </tr>
      `;
    })
    .join('');

  totalCostEl.textContent = `Coût total : ${formatMoney(estimate.totalCost)}`;
}

async function loadProjectAndEstimate() {
  if (!projectId) {
    return;
  }

  statusEl.className = 'muted';
  statusEl.textContent = 'Chargement des données du projet...';

  try {
    const project = await apiFetch(`/api/projects/${projectId}`);

    projectInfoEl.textContent = `Projet : ${project.projectName} (${project.clientName})`;

    if (!project.assumptions) {
      statusEl.className = 'error';
      statusEl.textContent = 'Ce projet n\'a pas encore d\'hypothèses. Veuillez les remplir d\'abord.';
      renderEstimate(null);
      return;
    }

    if (project.estimate) {
      statusEl.className = 'success';
      statusEl.textContent = `Estimation générée le ${new Date(project.estimate.generatedAt).toLocaleString('fr-CA')}.`;
      renderEstimate(project.estimate);
    } else {
      statusEl.className = 'muted';
      statusEl.textContent = 'Aucune estimation pour le moment. Cliquez sur Générer / recalculer l\'estimation.';
      renderEstimate(null);
    }
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = error.message;
  }
}

generateBtn.addEventListener('click', async () => {
  if (!projectId) {
    return;
  }

  statusEl.className = 'muted';
  statusEl.textContent = 'Génération de l\'estimation...';

  try {
    const updatedProject = await apiFetch(`/api/estimates/${projectId}/generate`, {
      method: 'POST'
    });

    statusEl.className = 'success';
    statusEl.textContent = `Estimation générée le ${new Date(updatedProject.estimate.generatedAt).toLocaleString('fr-CA')}.`;
    renderEstimate(updatedProject.estimate);
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = error.message;
  }
});

loadProjectAndEstimate();
