// Script dashboard autonome pour fonctionner même sans serveur Node (mode fichier local).

function setStatus(element, text, kind = 'muted') {
  element.className = kind;
  element.textContent = text;
}

function formatMoney(value) {
  const numeric = Number(value || 0);
  return `$${numeric.toFixed(2)}`;
}

function projectMeta(project) {
  const source = project.project || project;

  return {
    clientName: source.clientName || '-',
    projectName: source.projectName || '-',
    projectAddress: source.projectAddress || '-',
    projectType: source.projectType || '-'
  };
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Erreur API (${response.status})`);
  }

  return data;
}

const projectsList = document.getElementById('projectsList');
const dashboardStatus = document.getElementById('dashboardStatus');
const projectSearchInput = document.getElementById('projectSearchInput');
const projectsFoundCount = document.getElementById('projectsFoundCount');

let allProjectsCache = [];
let isDemoModeCache = false;
let filteredProjectsCache = [];

function setProjectsFoundCount(total) {
  if (!projectsFoundCount) {
    return;
  }

  projectsFoundCount.textContent = `${total} projet${total > 1 ? 's' : ''} trouvé${total > 1 ? 's' : ''}`;
}

// Projets locaux de démonstration pour tests UI hors connexion API.
const MOCK_PROJECTS = [
  {
    id: 'demo-001',
    clientName: 'Jean Tremblay',
    projectName: 'Maison Bellevue',
    projectAddress: '120 Rue des Pins, Gatineau, QC',
    projectType: 'Maison résidentielle',
    createdAt: '2026-03-20T14:30:00.000Z',
    updatedAt: '2026-03-25T09:10:00.000Z',
    total: 48650.25
  },
  {
    id: 'demo-002',
    clientName: 'Marie Gagnon',
    projectName: 'Chalet du Lac',
    projectAddress: '45 Chemin du Lac, Chelsea, QC',
    projectType: 'Bâtiment rectangulaire simple',
    createdAt: '2026-03-21T10:00:00.000Z',
    updatedAt: '2026-03-26T16:40:00.000Z',
    total: 32990.75
  },
  {
    id: 'demo-003',
    clientName: 'Luc Bouchard',
    projectName: 'Garage Nord',
    projectAddress: '88 Rue du Parc, Gatineau, QC',
    projectType: 'Bâtiment rectangulaire simple',
    createdAt: '2026-03-22T09:00:00.000Z',
    updatedAt: '2026-03-27T08:15:00.000Z',
    total: 21450.5
  },
  {
    id: 'demo-004',
    clientName: 'Sophie Lavoie',
    projectName: 'Rénovation Montcalm',
    projectAddress: '301 Av. Montcalm, Hull, QC',
    projectType: 'Rénovation',
    createdAt: '2026-03-22T13:30:00.000Z',
    updatedAt: '2026-03-27T11:05:00.000Z',
    total: 17890.0
  },
  {
    id: 'demo-005',
    clientName: 'Patrick Côté',
    projectName: 'Maison des Collines',
    projectAddress: '19 Ch. des Érables, Cantley, QC',
    projectType: 'Maison résidentielle',
    createdAt: '2026-03-23T08:40:00.000Z',
    updatedAt: '2026-03-27T14:20:00.000Z',
    total: 56220.3
  },
  {
    id: 'demo-006',
    clientName: 'Nadia Roy',
    projectName: 'Extension Plateau',
    projectAddress: '74 Rue du Plateau, Aylmer, QC',
    projectType: 'Rénovation',
    createdAt: '2026-03-23T15:10:00.000Z',
    updatedAt: '2026-03-27T16:55:00.000Z',
    total: 28975.9
  },
  {
    id: 'demo-007',
    clientName: 'Éric Gauthier',
    projectName: 'Chalet Boisé',
    projectAddress: '510 Ch. du Lac, Val-des-Monts, QC',
    projectType: 'Maison résidentielle',
    createdAt: '2026-03-24T07:25:00.000Z',
    updatedAt: '2026-03-28T08:00:00.000Z',
    total: 47110.8
  },
  {
    id: 'demo-008',
    clientName: 'Camille Gagné',
    projectName: 'Atelier Rivière',
    projectAddress: '12 Rue de la Rivière, Gatineau, QC',
    projectType: 'Bâtiment rectangulaire simple',
    createdAt: '2026-03-24T11:45:00.000Z',
    updatedAt: '2026-03-28T10:30:00.000Z',
    total: 25540.4
  },
  {
    id: 'demo-009',
    clientName: 'Alexandre Noël',
    projectName: 'Rénovation Cartier',
    projectAddress: '145 Boul. Cartier, Gatineau, QC',
    projectType: 'Rénovation',
    createdAt: '2026-03-24T16:20:00.000Z',
    updatedAt: '2026-03-28T12:10:00.000Z',
    total: 19840.0
  },
  {
    id: 'demo-010',
    clientName: 'Mélanie Poulin',
    projectName: 'Maison Panorama',
    projectAddress: '8 Rue Panorama, Chelsea, QC',
    projectType: 'Maison résidentielle',
    createdAt: '2026-03-25T09:50:00.000Z',
    updatedAt: '2026-03-28T15:45:00.000Z',
    total: 63490.6
  }
];

function renderProjects(projects, isDemo = false) {
  setProjectsFoundCount(projects.length);

  const rows = projects
    .map((project) => {
      const meta = projectMeta(project);
      const lastUpdate = new Date(project.updatedAt || project.createdAt).toLocaleString('fr-CA');
      const total = project.total || project.estimate?.total || 0;

      return `
        <tr>
          <td>${meta.projectName}</td>
          <td>${meta.clientName}</td>
          <td>${meta.projectAddress}</td>
          <td>${meta.projectType}${isDemo ? ' (Démo)' : ''}</td>
          <td>${lastUpdate}</td>
          <td>${formatMoney(total)}</td>
          <td>
            ${
              isDemo
                ? `<a class="button-link btn-ghost" href="project.html?projectId=${project.id}">Ouvrir (Démo)</a>`
                : `<a class="button-link btn-ghost" href="project.html?projectId=${project.id}">Ouvrir</a>`
            }
          </td>
        </tr>
      `;
    })
    .join('');

  if (!rows) {
    projectsList.innerHTML = '<p class="muted">Aucun projet ne correspond à la recherche.</p>';
    return;
  }

  projectsList.innerHTML = `
    <div class="table-wrap projects-scroll-wrap">
      <table>
        <thead>
          <tr>
            <th>Projet</th>
            <th>Client</th>
            <th>Adresse</th>
            <th>Type</th>
            <th>Mis à jour</th>
            <th>Total estimation</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function getProjectTimestamp(project) {
  const timestamp = Date.parse(project.updatedAt || project.createdAt || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortProjectsByMostRecent(projects) {
  return [...projects].sort((a, b) => getProjectTimestamp(b) - getProjectTimestamp(a));
}

function applyProjectSearch() {
  const query = (projectSearchInput?.value || '').trim().toLowerCase();

  if (!query) {
    filteredProjectsCache = sortProjectsByMostRecent(allProjectsCache);
    renderProjects(filteredProjectsCache, isDemoModeCache);
    return;
  }

  const filtered = allProjectsCache.filter((project) => {
    const meta = projectMeta(project);
    const haystack = [meta.projectName, meta.clientName, meta.projectAddress, meta.projectType]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });

  filteredProjectsCache = sortProjectsByMostRecent(filtered);
  renderProjects(filteredProjectsCache, isDemoModeCache);
}

async function loadProjects() {
  setStatus(dashboardStatus, 'Chargement des projets...', 'muted');

  // Si la page est ouverte directement depuis le disque (file://),
  // aucune API backend n'est disponible: on affiche directement les projets démo.
  if (window.location.protocol === 'file:') {
    allProjectsCache = MOCK_PROJECTS;
    isDemoModeCache = true;
    applyProjectSearch();
    setStatus(dashboardStatus, '', 'muted');
    return;
  }

  try {
    const projects = await apiFetch('/api/projects');

    if (!projects.length) {
      allProjectsCache = MOCK_PROJECTS;
      isDemoModeCache = true;
      applyProjectSearch();
      setStatus(dashboardStatus, '', 'muted');
      return;
    }

    allProjectsCache = projects;
    isDemoModeCache = false;
    applyProjectSearch();

    setStatus(dashboardStatus, `${projects.length} projet(s) affiché(s).`, 'success');
  } catch (error) {
    allProjectsCache = MOCK_PROJECTS;
    isDemoModeCache = true;
    applyProjectSearch();
    setStatus(dashboardStatus, '', 'muted');
  }
}

if (projectSearchInput) {
  projectSearchInput.addEventListener('input', applyProjectSearch);
}

loadProjects();
