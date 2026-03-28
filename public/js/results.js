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
  projectInfoEl.textContent = 'Missing projectId in URL.';
  generateBtn.disabled = true;
}

assumptionsLink.href = `/assumptions.html?projectId=${projectId || ''}`;

function renderEstimate(estimate) {
  if (!estimate || !estimate.items || !estimate.items.length) {
    resultsBody.innerHTML = '';
    totalCostEl.textContent = 'Total Cost: $0.00';
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

  totalCostEl.textContent = `Total Cost: ${formatMoney(estimate.totalCost)}`;
}

async function loadProjectAndEstimate() {
  if (!projectId) {
    return;
  }

  statusEl.className = 'muted';
  statusEl.textContent = 'Loading project data...';

  try {
    const project = await apiFetch(`/api/projects/${projectId}`);

    projectInfoEl.textContent = `Project: ${project.projectName} (${project.clientName})`;

    if (!project.assumptions) {
      statusEl.className = 'error';
      statusEl.textContent = 'This project has no assumptions yet. Please fill assumptions first.';
      renderEstimate(null);
      return;
    }

    if (project.estimate) {
      statusEl.className = 'success';
      statusEl.textContent = `Estimate generated on ${new Date(project.estimate.generatedAt).toLocaleString()}.`;
      renderEstimate(project.estimate);
    } else {
      statusEl.className = 'muted';
      statusEl.textContent = 'No estimate yet. Click Generate / Recalculate Estimate.';
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
  statusEl.textContent = 'Generating estimate...';

  try {
    const updatedProject = await apiFetch(`/api/estimates/${projectId}/generate`, {
      method: 'POST'
    });

    statusEl.className = 'success';
    statusEl.textContent = `Estimate generated on ${new Date(updatedProject.estimate.generatedAt).toLocaleString()}.`;
    renderEstimate(updatedProject.estimate);
  } catch (error) {
    statusEl.className = 'error';
    statusEl.textContent = error.message;
  }
});

loadProjectAndEstimate();
