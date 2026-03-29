// Page projet dédiée: affichage d'un projet sélectionné.
// Compatible mode API (serveur) et mode démo local sans backend.

const DEMO_PROJECTS = {
  'demo-001': {
    id: 'demo-001',
    clientName: 'Jean Tremblay',
    projectName: 'Maison Bellevue',
    projectAddress: '120 Rue des Pins, Gatineau, QC',
    projectType: 'Maison résidentielle',
    updatedAt: '2026-03-25T09:10:00.000Z',
    total: 48650.25
  },
  'demo-002': {
    id: 'demo-002',
    clientName: 'Marie Gagnon',
    projectName: 'Chalet du Lac',
    projectAddress: '45 Chemin du Lac, Chelsea, QC',
    projectType: 'Bâtiment rectangulaire simple',
    updatedAt: '2026-03-26T16:40:00.000Z',
    total: 32990.75
  },
  'demo-003': {
    id: 'demo-003',
    clientName: 'Luc Bouchard',
    projectName: 'Garage Nord',
    projectAddress: '88 Rue du Parc, Gatineau, QC',
    projectType: 'Bâtiment rectangulaire simple',
    updatedAt: '2026-03-27T08:15:00.000Z',
    total: 21450.5
  },
  'demo-004': {
    id: 'demo-004',
    clientName: 'Sophie Lavoie',
    projectName: 'Rénovation Montcalm',
    projectAddress: '301 Av. Montcalm, Hull, QC',
    projectType: 'Rénovation',
    updatedAt: '2026-03-27T11:05:00.000Z',
    total: 17890.0
  },
  'demo-005': {
    id: 'demo-005',
    clientName: 'Patrick Côté',
    projectName: 'Maison des Collines',
    projectAddress: '19 Ch. des Érables, Cantley, QC',
    projectType: 'Maison résidentielle',
    updatedAt: '2026-03-27T14:20:00.000Z',
    total: 56220.3
  },
  'demo-006': {
    id: 'demo-006',
    clientName: 'Nadia Roy',
    projectName: 'Extension Plateau',
    projectAddress: '74 Rue du Plateau, Aylmer, QC',
    projectType: 'Rénovation',
    updatedAt: '2026-03-27T16:55:00.000Z',
    total: 28975.9
  },
  'demo-007': {
    id: 'demo-007',
    clientName: 'Éric Gauthier',
    projectName: 'Chalet Boisé',
    projectAddress: '510 Ch. du Lac, Val-des-Monts, QC',
    projectType: 'Maison résidentielle',
    updatedAt: '2026-03-28T08:00:00.000Z',
    total: 47110.8
  },
  'demo-008': {
    id: 'demo-008',
    clientName: 'Camille Gagné',
    projectName: 'Atelier Rivière',
    projectAddress: '12 Rue de la Rivière, Gatineau, QC',
    projectType: 'Bâtiment rectangulaire simple',
    updatedAt: '2026-03-28T10:30:00.000Z',
    total: 25540.4
  },
  'demo-009': {
    id: 'demo-009',
    clientName: 'Alexandre Noël',
    projectName: 'Rénovation Cartier',
    projectAddress: '145 Boul. Cartier, Gatineau, QC',
    projectType: 'Rénovation',
    updatedAt: '2026-03-28T12:10:00.000Z',
    total: 19840.0
  },
  'demo-010': {
    id: 'demo-010',
    clientName: 'Mélanie Poulin',
    projectName: 'Maison Panorama',
    projectAddress: '8 Rue Panorama, Chelsea, QC',
    projectType: 'Maison résidentielle',
    updatedAt: '2026-03-28T15:45:00.000Z',
    total: 63490.6
  }
};

const DEMO_WORK_TYPE_BY_ID = {
  'demo-001': 'Construction neuve',
  'demo-002': 'Construction neuve',
  'demo-003': 'Projet',
  'demo-004': 'Rénovation',
  'demo-005': 'Construction neuve',
  'demo-006': 'Rénovation',
  'demo-007': 'Construction neuve',
  'demo-008': 'Projet',
  'demo-009': 'Démolition / Rénovation',
  'demo-010': 'Construction neuve'
};

function getDemoProjectInfoByType(projectInfoType) {
  const type = String(projectInfoType || 'new_construction').trim();

  if (type === 'renovation') {
    return {
      projectType: 'renovation',
      projectInfo: {
        buildingType: 'Maison unifamiliale',
        buildingAge: '1998',
        existingFloors: '2',
        hasBasement: 'Oui',
        affectedAreas: 'Cuisine, salle de bain, escalier',
        existingWallType: 'Connu',
        existingCeilingHeight: '8',
        renovationCategory: 'Intérieur complet',
        wallsRemoved: 'Oui',
        wallsAdded: 'Oui',
        structuralWork: 'Inconnu',
        flooringReplaced: 'Oui',
        kitchenReplaced: 'Oui',
        bathroomReplaced: 'Oui',
        electricalUpgrade: 'Oui',
        plumbingUpgrade: 'Oui',
        occupiedDuringWork: 'Oui',
        knownIssues: 'Possibles surprises dans les murs extérieurs.',
        finishLevel: 'Standard',
        notes: 'Maintenir une zone habitable pendant les travaux.'
      },
      architecturalPlansFileName: 'renovation-demo.pdf',
      floorPlanFileNames: ['existant-demo.pdf', 'propose-demo.pdf'],
      clientPreferencesNotes: 'Maintenir une zone habitable pendant les travaux.',
      updatedAt: '2026-03-28T16:00:00.000Z'
    };
  }

  if (type === 'demolition_renovation') {
    return {
      projectType: 'demolition_renovation',
      projectInfo: {
        buildingType: 'Duplex',
        buildingAge: '1974',
        numberOfFloors: '2',
        basementType: 'Sous-sol complet',
        demolitionType: 'Jusqu\'aux montants',
        areasToDemolish: 'Cuisine, salon, corridors',
        removePartitions: 'Oui',
        removeCeilings: 'Oui',
        removeFlooring: 'Oui',
        removeRoofCovering: 'Non',
        removeWindowsDoors: 'Oui',
        hazardousMaterials: 'Inconnu',
        shoringRequired: 'Oui',
        occupiedDuringWork: 'Non',
        disposalBinRequired: 'Oui',
        rebuildFraming: 'Oui',
        rebuildInsulation: 'Oui',
        rebuildDrywall: 'Oui',
        rebuildElectrical: 'Oui',
        rebuildPlumbing: 'Oui',
        notes: 'Inspection amiante recommandée avant phase démolition.'
      },
      architecturalPlansFileName: 'demo-demolition.pdf',
      floorPlanFileNames: ['releve-existant.pdf'],
      clientPreferencesNotes: 'Inspection amiante recommandée avant phase démolition.',
      updatedAt: '2026-03-28T16:00:00.000Z'
    };
  }

  if (type === 'small_project') {
    return {
      projectType: 'small_project',
      projectInfo: {
        structureType: 'Terrasse',
        attachedOrDetached: 'Attaché',
        length: '20',
        width: '12',
        height: '4',
        shape: 'Rectangulaire',
        numberOfLevels: '1',
        foundationSystem: 'Pieux vissés',
        framingMaterial: 'Bois traité',
        finishMaterial: 'Composite',
        roofIncluded: 'Oui',
        roofingMaterial: 'Métal',
        railingIncluded: 'Oui',
        stairsIncluded: 'Oui',
        skirtingIncluded: 'Non',
        existingStructureToRemove: 'Oui',
        siteConditions: 'Accès latéral étroit, pente légère.',
        notes: 'Prévoir protection du terrain existant.'
      },
      architecturalPlansFileName: 'demo-projet-accessoire.pdf',
      floorPlanFileNames: ['croquis-projet.pdf'],
      clientPreferencesNotes: 'Prévoir protection du terrain existant.',
      updatedAt: '2026-03-28T16:00:00.000Z'
    };
  }

  return {
    projectType: 'new_construction',
    projectInfo: {
      propertyType: 'Maison',
      buildScope: 'Construction complète',
      buildingLength: '42',
      buildingWidth: '28',
      numberOfStories: '2',
      basementType: 'Sous-sol complet',
      wallHeightBasement: '8',
      wallHeightMainFloor: '9',
      wallHeightSecondFloor: '8',
      wallHeightGarage: '9',
      hasCathedralCeiling: 'Oui',
      hasGarage: 'Oui',
      garageType: 'Attaché',
      garageSize: '22 x 24',
      interiorWallEstimate: '180',
      studSpacing: '16',
      wasteFactor: '10',
      roofStyle: 'Deux versants',
      roofPitch: '6/12',
      roofMaterial: 'Asphalte',
      hasFlatRoof: 'Non',
      flooringType: 'Bois d\'ingénierie',
      exteriorCladding: 'Fibrociment',
      notes: 'Prévoir sortie électrique extérieure côté terrasse.'
    },
    propertyType: 'Maison',
    buildScope: 'Construction complète',
    buildingLength: '42',
    buildingWidth: '28',
    numberOfStories: '2',
    basementType: 'Sous-sol complet',
    wallHeightBasement: '8',
    wallHeightMainFloor: '9',
    wallHeightSecondFloor: '8',
    wallHeightGarage: '9',
    hasCathedralCeiling: 'Oui',
    hasGarage: 'Oui',
    garageType: 'Attaché',
    garageSize: '22 x 24',
    interiorWallEstimate: '180',
    studSpacing: '16',
    wasteFactor: '10',
    roofStyle: 'Deux versants',
    roofPitch: '6/12',
    roofMaterial: 'Asphalte',
    hasFlatRoof: 'Non',
    flooringType: 'Bois d\'ingénierie',
    exteriorCladding: 'Fibrociment',
    architecturalPlansFileName: 'plans-neuf-demo.pdf',
    floorPlanFileNames: ['rdc-demo.pdf', 'etage-demo.pdf'],
    clientPreferencesNotes: 'Prévoir sortie électrique extérieure côté terrasse.',
    updatedAt: '2026-03-28T16:00:00.000Z'
  };
}

function completeDemoProject(project) {
  const base = project || {};
  const workType = DEMO_WORK_TYPE_BY_ID[base.id] || base.projectWorkType || 'Construction neuve';
  const projectInfoType = {
    'Construction neuve': 'new_construction',
    'Rénovation': 'renovation',
    'Démolition / Rénovation': 'demolition_renovation',
    Projet: 'small_project'
  }[workType] || 'new_construction';

  const completedProjectInformation = {
    ...getDemoProjectInfoByType(projectInfoType),
    ...(base.projectInformation || {}),
    projectType: projectInfoType,
    updatedAt: base.projectInformation?.updatedAt || '2026-03-28T16:00:00.000Z'
  };

  return {
    ...base,
    schemaVersion: 2,
    status: base.status || 'Brouillon',
    estimateNumber: base.estimateNumber || `EST-2026-${String(base.id || '').replace(/\D/g, '').padStart(3, '0')}`,
    projectWorkType: workType,
    location: {
      projectAddress: base.location?.projectAddress || base.projectAddress || 'Adresse projet à confirmer',
      city: base.location?.city || 'Gatineau',
      province: base.location?.province || 'QC',
      postalCode: base.location?.postalCode || 'J8X 0A1',
      region: base.location?.region || 'Outaouais',
      lotReference: base.location?.lotReference || 'Lot démo 123456',
      updatedAt: base.location?.updatedAt || '2026-03-28T16:00:00.000Z'
    },
    contact: {
      fullName: base.contact?.fullName || base.clientName || 'Client démo',
      address: base.contact?.address || base.projectAddress || 'Adresse client démo',
      projectAddress: base.contact?.projectAddress || base.projectAddress || 'Adresse projet démo',
      phoneNumber: base.contact?.phoneNumber || '819-555-0000',
      email: base.contact?.email || 'client.demo@exemple.ca',
      updatedAt: base.contact?.updatedAt || '2026-03-28T16:00:00.000Z'
    },
    profile: {
      planFileName: base.profile?.planFileName || 'plan-demo.pdf',
      planNotes: base.profile?.planNotes || 'Notes de plans démo complètes.',
      aiContextNotes: base.profile?.aiContextNotes || 'Contexte IA démo rempli pour validation.',
      specialPriceListsText: base.profile?.specialPriceListsText || 'Liste de prix spéciale démo appliquée.',
      specialPriceListFileName: base.profile?.specialPriceListFileName || 'liste-prix-demo.pdf',
      planFileNames: Array.isArray(base.profile?.planFileNames) && base.profile.planFileNames.length
        ? base.profile.planFileNames
        : ['plan-demo.pdf'],
      aiSupportFileNames: Array.isArray(base.profile?.aiSupportFileNames) && base.profile.aiSupportFileNames.length
        ? base.profile.aiSupportFileNames
        : ['support-ia-demo.pdf'],
      updatedAt: base.profile?.updatedAt || '2026-03-28T16:00:00.000Z'
    },
    materialLabor: {
      entries:
        Array.isArray(base.materialLabor?.entries) && base.materialLabor.entries.length
          ? base.materialLabor.entries
          : [
              {
                id: 'ml_demo_material_001',
                type: 'materiel',
                category: 'Framing',
                subType: 'Bois de charpente',
                itemName: "2-po x 10-po x 12-pi Bois d'épinette Grade Pro 2",
                quantity: '95',
                createdAt: '2026-03-28T16:00:00.000Z',
                updatedAt: '2026-03-28T16:00:00.000Z'
              },
              {
                id: 'ml_demo_labor_001',
                type: 'main_oeuvre',
                category: 'Charpente',
                subType: 'Équipe charpente',
                itemName: 'Heures d\'installation structure principale',
                quantity: '180',
                createdAt: '2026-03-28T16:00:00.000Z',
                updatedAt: '2026-03-28T16:00:00.000Z'
              }
            ],
      updatedAt: base.materialLabor?.updatedAt || '2026-03-28T16:00:00.000Z'
    },
    projectInformation: completedProjectInformation
  };
}

const projectTitleEl = document.getElementById('projectTitle');
const projectInfoEl = document.getElementById('projectInfo');
const projectStatusEl = document.getElementById('projectStatus');
const tabOverviewBtn = document.getElementById('tabOverviewBtn');
const tabLocationBtn = document.getElementById('tabLocationBtn');
const tabContactBtn = document.getElementById('tabContactBtn');
const tabProjectInformationBtn = document.getElementById('tabProjectInformationBtn');
const tabMaterialLaborBtn = document.getElementById('tabMaterialLaborBtn');
const tabOverviewPanel = document.getElementById('tabOverviewPanel');
const tabLocationPanel = document.getElementById('tabLocationPanel');
const tabContactPanel = document.getElementById('tabContactPanel');
const tabProjectInformationPanel = document.getElementById('tabProjectInformationPanel');
const tabMaterialLaborPanel = document.getElementById('tabMaterialLaborPanel');

const projectLocationForm = document.getElementById('projectLocationForm');
const locationStatusEl = document.getElementById('locationStatus');
const locationProjectAddressEl = document.getElementById('locationProjectAddress');
const locationCityEl = document.getElementById('locationCity');
const locationProvinceEl = document.getElementById('locationProvince');
const locationPostalCodeEl = document.getElementById('locationPostalCode');
const locationRegionEl = document.getElementById('locationRegion');
const locationLotReferenceEl = document.getElementById('locationLotReference');

const materialLaborAddEntryBtnEl = document.getElementById('materialLaborAddEntryBtn');
const materialLaborEntriesBodyEl = document.getElementById('materialLaborEntriesBody');
const materialLaborEmptyEl = document.getElementById('materialLaborEmpty');
const materialLaborStatusEl = document.getElementById('materialLaborStatus');
const materialLaborEditorEl = document.getElementById('materialLaborEditor');
const mlEntryTypeEl = document.getElementById('mlEntryType');
const mlEntryCategoryEl = document.getElementById('mlEntryCategory');
const mlEntrySubTypeEl = document.getElementById('mlEntrySubType');
const mlEntryItemEl = document.getElementById('mlEntryItem');
const mlEntryItemCustomEl = document.getElementById('mlEntryItemCustom');
const mlEntryQuantityEl = document.getElementById('mlEntryQuantity');
const mlEntrySaveBtnEl = document.getElementById('mlEntrySaveBtn');
const mlEntryCancelBtnEl = document.getElementById('mlEntryCancelBtn');

const projectInformationForm = document.getElementById('projectInformationForm');
const projectInformationStatusEl = document.getElementById('projectInformationStatus');
const projectInformationTitleEl = document.getElementById('projectInformationTitle');
const projectInformationHelpEl = document.getElementById('projectInformationHelp');
const generateAiPackageBtnEl = document.getElementById('generateAiPackageBtn');
const copyAiPromptBtnEl = document.getElementById('copyAiPromptBtn');
const aiPromptOutputEl = document.getElementById('aiPromptOutput');
const aiExportStatusEl = document.getElementById('aiExportStatus');
const projectInfoWorkTypeEl = document.getElementById('projectInfoWorkType');
const projectInfoPropertyTypeEl = document.getElementById('projectInfoPropertyType');
const projectInfoBuildScopeEl = document.getElementById('projectInfoBuildScope');
const projectInfoArchitecturalPlansEl = document.getElementById('projectInfoArchitecturalPlans');
const projectInfoArchitecturalPlansNameEl = document.getElementById('projectInfoArchitecturalPlansName');
const projectInfoFloorPlansEl = document.getElementById('projectInfoFloorPlans');
const projectInfoFloorPlansNameEl = document.getElementById('projectInfoFloorPlansName');
const projectInfoClientPreferencesEl = document.getElementById('projectInfoClientPreferences');
const projectInfoBuildingLengthEl = document.getElementById('projectInfoBuildingLength');
const projectInfoBuildingWidthEl = document.getElementById('projectInfoBuildingWidth');
const projectInfoNumberOfStoriesEl = document.getElementById('projectInfoNumberOfStories');
const projectInfoBasementTypeEl = document.getElementById('projectInfoBasementType');
const projectInfoWallHeightBasementEl = document.getElementById('projectInfoWallHeightBasement');
const projectInfoWallHeightMainFloorEl = document.getElementById('projectInfoWallHeightMainFloor');
const projectInfoWallHeightSecondFloorEl = document.getElementById('projectInfoWallHeightSecondFloor');
const projectInfoWallHeightGarageEl = document.getElementById('projectInfoWallHeightGarage');
const projectInfoHasCathedralCeilingEl = document.getElementById('projectInfoHasCathedralCeiling');
const projectInfoHasGarageEl = document.getElementById('projectInfoHasGarage');
const projectInfoGarageTypeEl = document.getElementById('projectInfoGarageType');
const projectInfoGarageSizeEl = document.getElementById('projectInfoGarageSize');
const projectInfoRoofPitchEl = document.getElementById('projectInfoRoofPitch');
const projectInfoRoofMaterialEl = document.getElementById('projectInfoRoofMaterial');
const projectInfoHasFlatRoofEl = document.getElementById('projectInfoHasFlatRoof');
const projectInfoInteriorWallEstimateEl = document.getElementById('projectInfoInteriorWallEstimate');
const projectInfoStudSpacingEl = document.getElementById('projectInfoStudSpacing');
const projectInfoWasteFactorEl = document.getElementById('projectInfoWasteFactor');
const projectInfoRoofStyleEl = document.getElementById('projectInfoRoofStyle');
const projectInfoFlooringTypeEl = document.getElementById('projectInfoFlooringType');
const projectInfoExteriorCladdingEl = document.getElementById('projectInfoExteriorCladding');

const projectInfoSectionNewConstructionEl = document.getElementById('projectInfoSectionNewConstruction');
const projectInfoSectionRenovationEl = document.getElementById('projectInfoSectionRenovation');
const projectInfoSectionDemolitionRenovationEl = document.getElementById('projectInfoSectionDemolitionRenovation');
const projectInfoSectionSmallProjectEl = document.getElementById('projectInfoSectionSmallProject');

const renovationBuildingTypeEl = document.getElementById('renovationBuildingType');
const renovationBuildingAgeEl = document.getElementById('renovationBuildingAge');
const renovationExistingFloorsEl = document.getElementById('renovationExistingFloors');
const renovationHasBasementEl = document.getElementById('renovationHasBasement');
const renovationAffectedAreasEl = document.getElementById('renovationAffectedAreas');
const renovationExistingWallTypeEl = document.getElementById('renovationExistingWallType');
const renovationExistingCeilingHeightEl = document.getElementById('renovationExistingCeilingHeight');
const renovationCategoryEl = document.getElementById('renovationCategory');
const renovationWallsRemovedEl = document.getElementById('renovationWallsRemoved');
const renovationWallsAddedEl = document.getElementById('renovationWallsAdded');
const renovationStructuralWorkEl = document.getElementById('renovationStructuralWork');
const renovationFlooringReplacedEl = document.getElementById('renovationFlooringReplaced');
const renovationKitchenReplacedEl = document.getElementById('renovationKitchenReplaced');
const renovationBathroomReplacedEl = document.getElementById('renovationBathroomReplaced');
const renovationElectricalUpgradeEl = document.getElementById('renovationElectricalUpgrade');
const renovationPlumbingUpgradeEl = document.getElementById('renovationPlumbingUpgrade');
const renovationOccupiedDuringWorkEl = document.getElementById('renovationOccupiedDuringWork');
const renovationKnownIssuesEl = document.getElementById('renovationKnownIssues');
const renovationFinishLevelEl = document.getElementById('renovationFinishLevel');
const renovationNotesEl = document.getElementById('renovationNotes');

const demolitionBuildingTypeEl = document.getElementById('demolitionBuildingType');
const demolitionBuildingAgeEl = document.getElementById('demolitionBuildingAge');
const demolitionNumberOfFloorsEl = document.getElementById('demolitionNumberOfFloors');
const demolitionBasementTypeEl = document.getElementById('demolitionBasementType');
const demolitionTypeEl = document.getElementById('demolitionType');
const demolitionAreasToDemolishEl = document.getElementById('demolitionAreasToDemolish');
const demolitionRemovePartitionsEl = document.getElementById('demolitionRemovePartitions');
const demolitionRemoveCeilingsEl = document.getElementById('demolitionRemoveCeilings');
const demolitionRemoveFlooringEl = document.getElementById('demolitionRemoveFlooring');
const demolitionRemoveRoofCoveringEl = document.getElementById('demolitionRemoveRoofCovering');
const demolitionRemoveWindowsDoorsEl = document.getElementById('demolitionRemoveWindowsDoors');
const demolitionHazardousMaterialsEl = document.getElementById('demolitionHazardousMaterials');
const demolitionShoringRequiredEl = document.getElementById('demolitionShoringRequired');
const demolitionOccupiedDuringWorkEl = document.getElementById('demolitionOccupiedDuringWork');
const demolitionDisposalBinRequiredEl = document.getElementById('demolitionDisposalBinRequired');
const demolitionRebuildFramingEl = document.getElementById('demolitionRebuildFraming');
const demolitionRebuildInsulationEl = document.getElementById('demolitionRebuildInsulation');
const demolitionRebuildDrywallEl = document.getElementById('demolitionRebuildDrywall');
const demolitionRebuildElectricalEl = document.getElementById('demolitionRebuildElectrical');
const demolitionRebuildPlumbingEl = document.getElementById('demolitionRebuildPlumbing');
const demolitionNotesEl = document.getElementById('demolitionNotes');

const smallProjectStructureTypeEl = document.getElementById('smallProjectStructureType');
const smallProjectAttachedOrDetachedEl = document.getElementById('smallProjectAttachedOrDetached');
const smallProjectLengthEl = document.getElementById('smallProjectLength');
const smallProjectWidthEl = document.getElementById('smallProjectWidth');
const smallProjectHeightEl = document.getElementById('smallProjectHeight');
const smallProjectShapeEl = document.getElementById('smallProjectShape');
const smallProjectNumberOfLevelsEl = document.getElementById('smallProjectNumberOfLevels');
const smallProjectFoundationSystemEl = document.getElementById('smallProjectFoundationSystem');
const smallProjectFramingMaterialEl = document.getElementById('smallProjectFramingMaterial');
const smallProjectFinishMaterialEl = document.getElementById('smallProjectFinishMaterial');
const smallProjectRoofIncludedEl = document.getElementById('smallProjectRoofIncluded');
const smallProjectRoofingMaterialEl = document.getElementById('smallProjectRoofingMaterial');
const smallProjectRailingIncludedEl = document.getElementById('smallProjectRailingIncluded');
const smallProjectStairsIncludedEl = document.getElementById('smallProjectStairsIncluded');
const smallProjectSkirtingIncludedEl = document.getElementById('smallProjectSkirtingIncluded');
const smallProjectExistingStructureToRemoveEl = document.getElementById('smallProjectExistingStructureToRemove');
const smallProjectSiteConditionsEl = document.getElementById('smallProjectSiteConditions');
const smallProjectNotesEl = document.getElementById('smallProjectNotes');

const projectContactForm = document.getElementById('projectContactForm');
const contactStatusEl = document.getElementById('contactStatus');
const contactFullNameEl = document.getElementById('contactFullName');
const contactAddressEl = document.getElementById('contactAddress');
const contactProjectAddressEl = document.getElementById('contactProjectAddress');
const contactPhoneNumberEl = document.getElementById('contactPhoneNumber');
const contactEmailEl = document.getElementById('contactEmail');

const attachmentsForm = document.getElementById('projectAttachmentsForm');
const attachmentsStatusEl = document.getElementById('attachmentsStatus');
const specialPriceListsTextEl = document.getElementById('specialPriceListsText');
const specialPriceListFileEl = document.getElementById('specialPriceListFile');
const specialPriceFileNameEl = document.getElementById('specialPriceFileName');
const planFilesEl = document.getElementById('planFiles');
const planFilesSelectedEl = document.getElementById('planFilesSelected');
const planNotesEl = document.getElementById('planNotes');
const aiSupportFilesEl = document.getElementById('aiSupportFiles');
const aiSupportFilesSelectedEl = document.getElementById('aiSupportFilesSelected');
const aiContextNotesEl = document.getElementById('aiContextNotes');
const readinessFillEl = document.getElementById('readinessFill');
const readinessPercentEl = document.getElementById('readinessPercent');
const readinessLabelEl = document.getElementById('readinessLabel');
const readinessSummaryEl = document.getElementById('readinessSummary');
const currentProjectSideLinkEl = document.getElementById('currentProjectSideLink');

let savedSpecialPriceListFileName = null;
let savedPlanFileNames = [];
let savedAiSupportFileNames = [];
let savedProjectInfoArchitecturalPlanName = null;
let savedProjectInfoFloorPlanNames = [];
let currentProjectId = null;
let isDemoProject = false;
let currentAiPackage = null;
let materialLaborEntries = [];
let materialLaborEditingIndex = -1;
let materialLaborEditingId = '';
const PROJECT_INFORMATION_PROPERTY_TYPE_OPTIONS = [
  'Maison',
  'Plex / duplex / triplex',
  'Garage',
  'Chalet',
  'Agrandissement'
];
const PROJECT_INFORMATION_BUILD_SCOPE_OPTIONS = [
  'Construction complète',
  'Enveloppe seulement',
  'Charpente seulement'
];
const PROJECT_INFORMATION_BASEMENT_OPTIONS = [
  'Aucun',
  'Sous-sol complet',
  'Sous-sol avec sortie extérieure',
  'Dalle sur sol',
  'Vide sanitaire'
];
const PROJECT_INFORMATION_YES_NO_OPTIONS = ['Oui', 'Non'];
const PROJECT_INFORMATION_GARAGE_TYPE_OPTIONS = ['Aucun', 'Attaché', 'Détaché'];
const PROJECT_INFORMATION_ROOF_MATERIAL_OPTIONS = ['Asphalte', 'Métal'];
const PROJECT_STATUS_OPTIONS = ['Brouillon', 'En révision', 'Envoyé au client', 'Approuvé', 'Perdu / annulé'];
const PROJECT_TYPE_OPTIONS = [
  'Maison résidentielle',
  'Plex',
  'Garage',
  'Chalet',
  'Autre'
];
const PROJECT_WORK_TYPE_OPTIONS = ['Construction neuve', 'Rénovation', 'Démolition / Rénovation', 'Projet'];
const PROJECT_INFO_TYPE_KEYS = {
  'Construction neuve': 'new_construction',
  'Rénovation': 'renovation',
  'Démolition / Rénovation': 'demolition_renovation',
  Projet: 'small_project'
};
const PROJECT_INFO_KEY_TO_WORK_TYPE = {
  new_construction: 'Construction neuve',
  renovation: 'Rénovation',
  demolition_renovation: 'Démolition / Rénovation',
  small_project: 'Projet'
};
let currentProjectData = null;

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function escapeHtmlAttribute(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function normalizeProjectStatus(status) {
  const value = String(status || '').trim();
  return PROJECT_STATUS_OPTIONS.includes(value) ? value : 'Brouillon';
}

function normalizeProjectType(projectType) {
  const value = String(projectType || '').trim();
  return PROJECT_TYPE_OPTIONS.includes(value) ? value : 'Autre';
}

function normalizeProjectInformationPropertyType(propertyType) {
  const value = String(propertyType || '').trim();
  const map = {
    House: 'Maison',
    Addition: 'Agrandissement'
  };
  const normalized = map[value] || value;
  return PROJECT_INFORMATION_PROPERTY_TYPE_OPTIONS.includes(normalized) ? normalized : 'Maison';
}

function normalizeProjectInformationBuildScope(buildScope) {
  const value = String(buildScope || '').trim();
  const map = {
    'full build': 'Construction complète',
    'shell only': 'Enveloppe seulement',
    'framing only': 'Charpente seulement'
  };
  const normalized = map[value] || value;
  return PROJECT_INFORMATION_BUILD_SCOPE_OPTIONS.includes(normalized) ? normalized : 'Construction complète';
}

function normalizeProjectInformationBasementType(basementType) {
  const value = String(basementType || '').trim();
  const map = {
    none: 'Aucun',
    'full basement': 'Sous-sol complet',
    'walkout basement': 'Sous-sol avec sortie extérieure',
    'slab-on-grade': 'Dalle sur sol',
    crawlspace: 'Vide sanitaire'
  };
  const normalized = map[value] || value;
  return PROJECT_INFORMATION_BASEMENT_OPTIONS.includes(normalized) ? normalized : 'Aucun';
}

function normalizeYesNo(value, fallback = 'Non') {
  const raw = String(value || '').trim();
  const map = {
    Yes: 'Oui',
    yes: 'Oui',
    true: 'Oui',
    No: 'Non',
    no: 'Non',
    false: 'Non'
  };
  const normalized = map[raw] || raw;
  return PROJECT_INFORMATION_YES_NO_OPTIONS.includes(normalized) ? normalized : fallback;
}

function normalizeGarageType(value, fallback = 'Aucun') {
  const raw = String(value || '').trim();
  const map = {
    none: 'Aucun',
    attached: 'Attaché',
    detached: 'Détaché'
  };
  const normalized = map[raw] || raw;
  return PROJECT_INFORMATION_GARAGE_TYPE_OPTIONS.includes(normalized) ? normalized : fallback;
}

function normalizeRoofMaterial(value, fallback = 'Asphalte') {
  const raw = String(value || '').trim();
  const map = {
    Asphalt: 'Asphalte',
    Metal: 'Métal'
  };
  const normalized = map[raw] || raw;
  return PROJECT_INFORMATION_ROOF_MATERIAL_OPTIONS.includes(normalized) ? normalized : fallback;
}

function cleanNumberishInput(value) {
  const text = String(value ?? '').trim();
  if (!text) {
    return '';
  }

  const numeric = Number(text);
  return Number.isFinite(numeric) ? String(numeric) : '';
}

function getProjectInfoTypeKey(workType) {
  const value = String(workType || '').trim();
  return PROJECT_INFO_TYPE_KEYS[value] || 'new_construction';
}

function getWorkTypeFromProjectInfoTypeKey(projectInfoType) {
  const key = String(projectInfoType || '').trim();
  return PROJECT_INFO_KEY_TO_WORK_TYPE[key] || 'Construction neuve';
}

function setInputValue(element, value) {
  if (!element) {
    return;
  }

  element.value = String(value ?? '').trim();
}

function setNumberInputValue(element, value) {
  if (!element) {
    return;
  }

  element.value = cleanNumberishInput(value);
}

function renderProjectTypeFields(projectInfoType) {
  const key = String(projectInfoType || '').trim();

  if (projectInfoSectionNewConstructionEl) {
    projectInfoSectionNewConstructionEl.hidden = key !== 'new_construction';
  }
  if (projectInfoSectionRenovationEl) {
    projectInfoSectionRenovationEl.hidden = key !== 'renovation';
  }
  if (projectInfoSectionDemolitionRenovationEl) {
    projectInfoSectionDemolitionRenovationEl.hidden = key !== 'demolition_renovation';
  }
  if (projectInfoSectionSmallProjectEl) {
    projectInfoSectionSmallProjectEl.hidden = key !== 'small_project';
  }
}

function updateProjectInformationHeader(projectInfoType) {
  const key = String(projectInfoType || '').trim();
  const uiMap = {
    new_construction: {
      title: 'Information projet — Construction neuve',
      help: 'Complétez les dimensions, la structure et les choix de matériaux pour une estimation plus précise.'
    },
    renovation: {
      title: 'Information projet — Rénovation',
      help: 'Documentez les zones à rénover, le niveau de finition et les mises à niveau techniques.'
    },
    demolition_renovation: {
      title: 'Information projet — Démolition / Rénovation',
      help: 'Précisez les éléments à démolir et les composantes à reconstruire pour cadrer la portée.'
    },
    small_project: {
      title: 'Information projet — Projet accessoire',
      help: 'Renseignez la géométrie, le système de support et les options de finition du projet.'
    }
  };

  const selectedUi = uiMap[key] || {
    title: 'Information projet',
    help: 'Sélectionnez d\'abord un type de projet pour afficher les champs pertinents.'
  };

  if (projectInformationTitleEl) {
    projectInformationTitleEl.textContent = selectedUi.title;
  }

  if (projectInformationHelpEl) {
    projectInformationHelpEl.textContent = selectedUi.help;
  }
}

function getProjectInfoPayload(projectInfoType) {
  const key = String(projectInfoType || 'new_construction').trim() || 'new_construction';

  if (key === 'renovation') {
    return {
      buildingType: String(renovationBuildingTypeEl?.value || '').trim(),
      buildingAge: String(renovationBuildingAgeEl?.value || '').trim(),
      existingFloors: cleanNumberishInput(renovationExistingFloorsEl?.value),
      hasBasement: normalizeYesNo(renovationHasBasementEl?.value, 'Non'),
      affectedAreas: String(renovationAffectedAreasEl?.value || '').trim(),
      existingWallType: String(renovationExistingWallTypeEl?.value || '').trim(),
      existingCeilingHeight: cleanNumberishInput(renovationExistingCeilingHeightEl?.value),
      renovationCategory: String(renovationCategoryEl?.value || '').trim(),
      wallsRemoved: normalizeYesNo(renovationWallsRemovedEl?.value, 'Non'),
      wallsAdded: normalizeYesNo(renovationWallsAddedEl?.value, 'Non'),
      structuralWork: String(renovationStructuralWorkEl?.value || '').trim() || 'Inconnu',
      flooringReplaced: normalizeYesNo(renovationFlooringReplacedEl?.value, 'Non'),
      kitchenReplaced: normalizeYesNo(renovationKitchenReplacedEl?.value, 'Non'),
      bathroomReplaced: normalizeYesNo(renovationBathroomReplacedEl?.value, 'Non'),
      electricalUpgrade: normalizeYesNo(renovationElectricalUpgradeEl?.value, 'Non'),
      plumbingUpgrade: normalizeYesNo(renovationPlumbingUpgradeEl?.value, 'Non'),
      occupiedDuringWork: normalizeYesNo(renovationOccupiedDuringWorkEl?.value, 'Non'),
      knownIssues: String(renovationKnownIssuesEl?.value || '').trim(),
      finishLevel: String(renovationFinishLevelEl?.value || '').trim(),
      notes: String(renovationNotesEl?.value || '').trim()
    };
  }

  if (key === 'demolition_renovation') {
    return {
      buildingType: String(demolitionBuildingTypeEl?.value || '').trim(),
      buildingAge: String(demolitionBuildingAgeEl?.value || '').trim(),
      numberOfFloors: cleanNumberishInput(demolitionNumberOfFloorsEl?.value),
      basementType: normalizeProjectInformationBasementType(demolitionBasementTypeEl?.value),
      demolitionType: String(demolitionTypeEl?.value || '').trim(),
      areasToDemolish: String(demolitionAreasToDemolishEl?.value || '').trim(),
      removePartitions: normalizeYesNo(demolitionRemovePartitionsEl?.value, 'Non'),
      removeCeilings: normalizeYesNo(demolitionRemoveCeilingsEl?.value, 'Non'),
      removeFlooring: normalizeYesNo(demolitionRemoveFlooringEl?.value, 'Non'),
      removeRoofCovering: normalizeYesNo(demolitionRemoveRoofCoveringEl?.value, 'Non'),
      removeWindowsDoors: normalizeYesNo(demolitionRemoveWindowsDoorsEl?.value, 'Non'),
      hazardousMaterials: String(demolitionHazardousMaterialsEl?.value || '').trim() || 'Inconnu',
      shoringRequired: String(demolitionShoringRequiredEl?.value || '').trim() || 'Inconnu',
      occupiedDuringWork: normalizeYesNo(demolitionOccupiedDuringWorkEl?.value, 'Non'),
      disposalBinRequired: normalizeYesNo(demolitionDisposalBinRequiredEl?.value, 'Non'),
      rebuildFraming: normalizeYesNo(demolitionRebuildFramingEl?.value, 'Non'),
      rebuildInsulation: normalizeYesNo(demolitionRebuildInsulationEl?.value, 'Non'),
      rebuildDrywall: normalizeYesNo(demolitionRebuildDrywallEl?.value, 'Non'),
      rebuildElectrical: normalizeYesNo(demolitionRebuildElectricalEl?.value, 'Non'),
      rebuildPlumbing: normalizeYesNo(demolitionRebuildPlumbingEl?.value, 'Non'),
      notes: String(demolitionNotesEl?.value || '').trim()
    };
  }

  if (key === 'small_project') {
    return {
      structureType: String(smallProjectStructureTypeEl?.value || '').trim(),
      attachedOrDetached: String(smallProjectAttachedOrDetachedEl?.value || '').trim(),
      length: cleanNumberishInput(smallProjectLengthEl?.value),
      width: cleanNumberishInput(smallProjectWidthEl?.value),
      height: cleanNumberishInput(smallProjectHeightEl?.value),
      shape: String(smallProjectShapeEl?.value || '').trim(),
      numberOfLevels: cleanNumberishInput(smallProjectNumberOfLevelsEl?.value),
      foundationSystem: String(smallProjectFoundationSystemEl?.value || '').trim(),
      framingMaterial: String(smallProjectFramingMaterialEl?.value || '').trim(),
      finishMaterial: String(smallProjectFinishMaterialEl?.value || '').trim(),
      roofIncluded: normalizeYesNo(smallProjectRoofIncludedEl?.value, 'Non'),
      roofingMaterial: String(smallProjectRoofingMaterialEl?.value || '').trim(),
      railingIncluded: normalizeYesNo(smallProjectRailingIncludedEl?.value, 'Non'),
      stairsIncluded: normalizeYesNo(smallProjectStairsIncludedEl?.value, 'Non'),
      skirtingIncluded: normalizeYesNo(smallProjectSkirtingIncludedEl?.value, 'Non'),
      existingStructureToRemove: normalizeYesNo(smallProjectExistingStructureToRemoveEl?.value, 'Non'),
      siteConditions: String(smallProjectSiteConditionsEl?.value || '').trim(),
      notes: String(smallProjectNotesEl?.value || '').trim()
    };
  }

  return {
    propertyType: normalizeProjectInformationPropertyType(projectInfoPropertyTypeEl?.value),
    buildScope: normalizeProjectInformationBuildScope(projectInfoBuildScopeEl?.value),
    buildingLength: cleanNumberishInput(projectInfoBuildingLengthEl?.value),
    buildingWidth: cleanNumberishInput(projectInfoBuildingWidthEl?.value),
    numberOfStories: cleanNumberishInput(projectInfoNumberOfStoriesEl?.value),
    basementType: normalizeProjectInformationBasementType(projectInfoBasementTypeEl?.value),
    wallHeightBasement: cleanNumberishInput(projectInfoWallHeightBasementEl?.value),
    wallHeightMainFloor: cleanNumberishInput(projectInfoWallHeightMainFloorEl?.value),
    wallHeightSecondFloor: cleanNumberishInput(projectInfoWallHeightSecondFloorEl?.value),
    wallHeightGarage: cleanNumberishInput(projectInfoWallHeightGarageEl?.value),
    hasCathedralCeiling: normalizeYesNo(projectInfoHasCathedralCeilingEl?.value, 'Non'),
    hasGarage: normalizeYesNo(projectInfoHasGarageEl?.value, 'Non'),
    garageType:
      normalizeYesNo(projectInfoHasGarageEl?.value, 'Non') === 'Oui'
        ? normalizeGarageType(projectInfoGarageTypeEl?.value, 'Attaché')
        : 'Aucun',
    garageSize:
      normalizeYesNo(projectInfoHasGarageEl?.value, 'Non') === 'Oui'
        ? String(projectInfoGarageSizeEl?.value || '').trim()
        : '',
    interiorWallEstimate: cleanNumberishInput(projectInfoInteriorWallEstimateEl?.value),
    studSpacing: cleanNumberishInput(projectInfoStudSpacingEl?.value),
    wasteFactor: cleanNumberishInput(projectInfoWasteFactorEl?.value),
    roofStyle: String(projectInfoRoofStyleEl?.value || '').trim(),
    roofPitch: String(projectInfoRoofPitchEl?.value || '').trim(),
    roofMaterial: normalizeRoofMaterial(projectInfoRoofMaterialEl?.value, 'Asphalte'),
    hasFlatRoof: normalizeYesNo(projectInfoHasFlatRoofEl?.value, 'Non'),
    flooringType: String(projectInfoFlooringTypeEl?.value || '').trim(),
    exteriorCladding: String(projectInfoExteriorCladdingEl?.value || '').trim(),
    notes: String(projectInfoClientPreferencesEl?.value || '').trim()
  };
}

function populateProjectInfo(projectInfoType, projectInfoData = {}) {
  const key = String(projectInfoType || 'new_construction').trim() || 'new_construction';

  if (key === 'renovation') {
    setInputValue(renovationBuildingTypeEl, projectInfoData.buildingType);
    setInputValue(renovationBuildingAgeEl, projectInfoData.buildingAge);
    setNumberInputValue(renovationExistingFloorsEl, projectInfoData.existingFloors);
    setInputValue(renovationHasBasementEl, normalizeYesNo(projectInfoData.hasBasement, 'Non'));
    setInputValue(renovationAffectedAreasEl, projectInfoData.affectedAreas);
    setInputValue(renovationExistingWallTypeEl, projectInfoData.existingWallType || 'Connu');
    setNumberInputValue(renovationExistingCeilingHeightEl, projectInfoData.existingCeilingHeight);
    setInputValue(renovationCategoryEl, projectInfoData.renovationCategory || 'Cuisine');
    setInputValue(renovationWallsRemovedEl, normalizeYesNo(projectInfoData.wallsRemoved, 'Non'));
    setInputValue(renovationWallsAddedEl, normalizeYesNo(projectInfoData.wallsAdded, 'Non'));
    setInputValue(renovationStructuralWorkEl, String(projectInfoData.structuralWork || 'Inconnu'));
    setInputValue(renovationFlooringReplacedEl, normalizeYesNo(projectInfoData.flooringReplaced, 'Non'));
    setInputValue(renovationKitchenReplacedEl, normalizeYesNo(projectInfoData.kitchenReplaced, 'Non'));
    setInputValue(renovationBathroomReplacedEl, normalizeYesNo(projectInfoData.bathroomReplaced, 'Non'));
    setInputValue(renovationElectricalUpgradeEl, normalizeYesNo(projectInfoData.electricalUpgrade, 'Non'));
    setInputValue(renovationPlumbingUpgradeEl, normalizeYesNo(projectInfoData.plumbingUpgrade, 'Non'));
    setInputValue(renovationOccupiedDuringWorkEl, normalizeYesNo(projectInfoData.occupiedDuringWork, 'Non'));
    setInputValue(renovationKnownIssuesEl, projectInfoData.knownIssues);
    setInputValue(renovationFinishLevelEl, projectInfoData.finishLevel || 'Standard');
    setInputValue(renovationNotesEl, projectInfoData.notes);
    return;
  }

  if (key === 'demolition_renovation') {
    setInputValue(demolitionBuildingTypeEl, projectInfoData.buildingType);
    setInputValue(demolitionBuildingAgeEl, projectInfoData.buildingAge);
    setNumberInputValue(demolitionNumberOfFloorsEl, projectInfoData.numberOfFloors);
    setInputValue(demolitionBasementTypeEl, normalizeProjectInformationBasementType(projectInfoData.basementType));
    setInputValue(demolitionTypeEl, projectInfoData.demolitionType || 'Sélective');
    setInputValue(demolitionAreasToDemolishEl, projectInfoData.areasToDemolish);
    setInputValue(demolitionRemovePartitionsEl, normalizeYesNo(projectInfoData.removePartitions, 'Non'));
    setInputValue(demolitionRemoveCeilingsEl, normalizeYesNo(projectInfoData.removeCeilings, 'Non'));
    setInputValue(demolitionRemoveFlooringEl, normalizeYesNo(projectInfoData.removeFlooring, 'Non'));
    setInputValue(demolitionRemoveRoofCoveringEl, normalizeYesNo(projectInfoData.removeRoofCovering, 'Non'));
    setInputValue(demolitionRemoveWindowsDoorsEl, normalizeYesNo(projectInfoData.removeWindowsDoors, 'Non'));
    setInputValue(demolitionHazardousMaterialsEl, String(projectInfoData.hazardousMaterials || 'Inconnu'));
    setInputValue(demolitionShoringRequiredEl, String(projectInfoData.shoringRequired || 'Inconnu'));
    setInputValue(demolitionOccupiedDuringWorkEl, normalizeYesNo(projectInfoData.occupiedDuringWork, 'Non'));
    setInputValue(demolitionDisposalBinRequiredEl, normalizeYesNo(projectInfoData.disposalBinRequired, 'Non'));
    setInputValue(demolitionRebuildFramingEl, normalizeYesNo(projectInfoData.rebuildFraming, 'Non'));
    setInputValue(demolitionRebuildInsulationEl, normalizeYesNo(projectInfoData.rebuildInsulation, 'Non'));
    setInputValue(demolitionRebuildDrywallEl, normalizeYesNo(projectInfoData.rebuildDrywall, 'Non'));
    setInputValue(demolitionRebuildElectricalEl, normalizeYesNo(projectInfoData.rebuildElectrical, 'Non'));
    setInputValue(demolitionRebuildPlumbingEl, normalizeYesNo(projectInfoData.rebuildPlumbing, 'Non'));
    setInputValue(demolitionNotesEl, projectInfoData.notes);
    return;
  }

  if (key === 'small_project') {
    setInputValue(smallProjectStructureTypeEl, projectInfoData.structureType || 'Terrasse');
    setInputValue(smallProjectAttachedOrDetachedEl, projectInfoData.attachedOrDetached || 'Détaché');
    setNumberInputValue(smallProjectLengthEl, projectInfoData.length);
    setNumberInputValue(smallProjectWidthEl, projectInfoData.width);
    setNumberInputValue(smallProjectHeightEl, projectInfoData.height);
    setInputValue(smallProjectShapeEl, projectInfoData.shape || 'Rectangulaire');
    setNumberInputValue(smallProjectNumberOfLevelsEl, projectInfoData.numberOfLevels);
    setInputValue(smallProjectFoundationSystemEl, projectInfoData.foundationSystem || 'Sonotubes');
    setInputValue(smallProjectFramingMaterialEl, projectInfoData.framingMaterial);
    setInputValue(smallProjectFinishMaterialEl, projectInfoData.finishMaterial);
    setInputValue(smallProjectRoofIncludedEl, normalizeYesNo(projectInfoData.roofIncluded, 'Non'));
    setInputValue(smallProjectRoofingMaterialEl, projectInfoData.roofingMaterial);
    setInputValue(smallProjectRailingIncludedEl, normalizeYesNo(projectInfoData.railingIncluded, 'Non'));
    setInputValue(smallProjectStairsIncludedEl, normalizeYesNo(projectInfoData.stairsIncluded, 'Non'));
    setInputValue(smallProjectSkirtingIncludedEl, normalizeYesNo(projectInfoData.skirtingIncluded, 'Non'));
    setInputValue(
      smallProjectExistingStructureToRemoveEl,
      normalizeYesNo(projectInfoData.existingStructureToRemove, 'Non')
    );
    setInputValue(smallProjectSiteConditionsEl, projectInfoData.siteConditions);
    setInputValue(smallProjectNotesEl, projectInfoData.notes);
    return;
  }

  if (projectInfoPropertyTypeEl) {
    projectInfoPropertyTypeEl.value = normalizeProjectInformationPropertyType(projectInfoData.propertyType);
  }
  if (projectInfoBuildScopeEl) {
    projectInfoBuildScopeEl.value = normalizeProjectInformationBuildScope(projectInfoData.buildScope);
  }
  setNumberInputValue(projectInfoBuildingLengthEl, projectInfoData.buildingLength);
  setNumberInputValue(projectInfoBuildingWidthEl, projectInfoData.buildingWidth);
  setNumberInputValue(projectInfoNumberOfStoriesEl, projectInfoData.numberOfStories);
  if (projectInfoBasementTypeEl) {
    projectInfoBasementTypeEl.value = normalizeProjectInformationBasementType(projectInfoData.basementType);
  }
  setNumberInputValue(projectInfoWallHeightBasementEl, projectInfoData.wallHeightBasement);
  setNumberInputValue(projectInfoWallHeightMainFloorEl, projectInfoData.wallHeightMainFloor);
  setNumberInputValue(projectInfoWallHeightSecondFloorEl, projectInfoData.wallHeightSecondFloor);
  setNumberInputValue(projectInfoWallHeightGarageEl, projectInfoData.wallHeightGarage);
  if (projectInfoHasCathedralCeilingEl) {
    projectInfoHasCathedralCeilingEl.value = normalizeYesNo(projectInfoData.hasCathedralCeiling, 'Non');
  }
  if (projectInfoHasGarageEl) {
    projectInfoHasGarageEl.value = normalizeYesNo(projectInfoData.hasGarage, 'Non');
  }
  if (projectInfoGarageTypeEl) {
    const defaultGarageType = normalizeYesNo(projectInfoData.hasGarage, 'Non') === 'Oui' ? 'Attaché' : 'Aucun';
    projectInfoGarageTypeEl.value = normalizeGarageType(projectInfoData.garageType, defaultGarageType);
  }
  setInputValue(projectInfoGarageSizeEl, projectInfoData.garageSize);
  setNumberInputValue(projectInfoInteriorWallEstimateEl, projectInfoData.interiorWallEstimate);
  setNumberInputValue(projectInfoStudSpacingEl, projectInfoData.studSpacing);
  setNumberInputValue(projectInfoWasteFactorEl, projectInfoData.wasteFactor);
  setInputValue(projectInfoRoofStyleEl, projectInfoData.roofStyle);
  setInputValue(projectInfoRoofPitchEl, projectInfoData.roofPitch);
  if (projectInfoRoofMaterialEl) {
    projectInfoRoofMaterialEl.value = normalizeRoofMaterial(projectInfoData.roofMaterial, 'Asphalte');
  }
  if (projectInfoHasFlatRoofEl) {
    projectInfoHasFlatRoofEl.value = normalizeYesNo(projectInfoData.hasFlatRoof, 'Non');
  }
  setInputValue(projectInfoFlooringTypeEl, projectInfoData.flooringType);
  setInputValue(projectInfoExteriorCladdingEl, projectInfoData.exteriorCladding);
  setInputValue(projectInfoClientPreferencesEl, projectInfoData.notes);
}

function normalizeProjectWorkType(projectWorkType) {
  const value = String(projectWorkType || '').trim();
  return PROJECT_WORK_TYPE_OPTIONS.includes(value) ? value : 'Projet';
}

function buildEstimateNumber(project) {
  if (project?.estimateNumber && String(project.estimateNumber).trim()) {
    return String(project.estimateNumber).trim();
  }

  const year = new Date().getFullYear();
  const rawId = String(project?.id || '').replace(/\D/g, '');
  const padded = (rawId || '1').slice(-3).padStart(3, '0');
  return `EST-${year}-${padded}`;
}

function setStatus(text, kind = 'muted') {
  projectStatusEl.className = kind;
  projectStatusEl.textContent = text;
}

function setAttachmentStatus(text, kind = 'muted') {
  if (!attachmentsStatusEl) {
    return;
  }

  attachmentsStatusEl.className = kind;
  attachmentsStatusEl.textContent = text;
}

function setContactStatus(text, kind = 'muted') {
  if (!contactStatusEl) {
    return;
  }

  contactStatusEl.className = kind;
  contactStatusEl.textContent = text;
}

function setLocationStatus(text, kind = 'muted') {
  if (!locationStatusEl) {
    return;
  }

  locationStatusEl.className = kind;
  locationStatusEl.textContent = text;
}

function setMaterialLaborStatus(text, kind = 'muted') {
  if (!materialLaborStatusEl) {
    return;
  }

  materialLaborStatusEl.className = kind;
  materialLaborStatusEl.textContent = text;
}

function normalizeEntryType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (['materiel', 'matériel', 'material', 'm'].includes(normalized)) {
    return 'materiel';
  }

  if (['main doeuvre', 'main d oeuvre', 'main d\'oeuvre', 'main-doeuvre', 'labour', 'labor', 'l'].includes(normalized)) {
    return 'main_oeuvre';
  }

  return '';
}

function entryTypeLabel(type) {
  return type === 'main_oeuvre' ? 'Main d’œuvre' : 'Matériel';
}

function formatQty(value) {
  const num = Number(value);
  return Number.isFinite(num) ? String(num) : '0';
}

function buildGuidedCatalog() {
  return {
    materiel: {
      Framing: {
        'Bois de charpente': [
          "2-po x 4-po x 8-pi Bois d'épinette Grade Pro 2",
          "2-po x 6-po x 8-pi Bois d'épinette Grade Pro 2",
          "2-po x 8-po x 10-pi Bois d'épinette Grade Pro 2",
          "2-po x 10-po x 12-pi Bois d'épinette Grade Pro 2",
          'OSB 7/16 4x8',
          'Autre'
        ],
        Quincaillerie: ['Étriers', 'Sabots', 'Ancrages', 'Vis structurelles', 'Autre']
      },
      Toiture: {
        'Revêtement toiture': ['Bardeaux asphalte', 'Toiture métallique', 'Membrane', 'Autre'],
        Structure: ['Fermes de toit', 'Pannes', 'Contreplaqué toiture', 'Autre']
      },
      Isolation: {
        Isolation: ['Laine minérale', 'Uréthane giclé', 'Cellulose', 'Autre']
      },
      Finition: {
        Plancher: ['Bois franc', 'Vinyle', 'Céramique', 'Autre'],
        Revêtement: ['Gypse', 'Fibrociment', 'Vinyle', 'Autre']
      },
      Autre: {
        Autre: ['Article personnalisé', 'Autre']
      }
    },
    main_oeuvre: {
      Charpente: {
        'Équipe charpente': ['Heures charpentier', 'Heures manœuvre', 'Heures chef d’équipe', 'Autre']
      },
      Démolition: {
        Démolition: ['Heures démolition intérieure', 'Heures tri et évacuation', 'Autre']
      },
      Finition: {
        Finition: ['Heures finition intérieure', 'Heures peinture/préparation', 'Autre']
      },
      Gestion: {
        Gestion: ['Heures gestion de projet', 'Heures coordination chantier', 'Autre']
      },
      Autre: {
        Autre: ['Tâche personnalisée', 'Autre']
      }
    }
  };
}

function getCategoryOptions(type) {
  const catalog = buildGuidedCatalog();
  return Object.keys(catalog[type] || {});
}

function getSubTypeOptions(type, category) {
  const catalog = buildGuidedCatalog();
  return Object.keys(catalog[type]?.[category] || {});
}

function getItemOptions(type, category, subType) {
  const catalog = buildGuidedCatalog();
  return catalog[type]?.[category]?.[subType] || ['Autre'];
}

function fillSelectOptions(selectEl, values, defaultValue = '') {
  if (!selectEl) {
    return;
  }

  selectEl.innerHTML = values
    .map((value) => `<option value="${escapeHtmlAttribute(value)}">${escapeHtmlAttribute(value)}</option>`)
    .join('');

  if (defaultValue && values.includes(defaultValue)) {
    selectEl.value = defaultValue;
  } else if (values.length) {
    selectEl.value = values[0];
  }
}

function updateGuidedCategoryOptions(defaultCategory = '') {
  const type = normalizeEntryType(mlEntryTypeEl?.value || 'materiel') || 'materiel';
  fillSelectOptions(mlEntryCategoryEl, getCategoryOptions(type), defaultCategory);
  updateGuidedSubTypeOptions();
}

function updateGuidedSubTypeOptions(defaultSubType = '') {
  const type = normalizeEntryType(mlEntryTypeEl?.value || 'materiel') || 'materiel';
  const category = String(mlEntryCategoryEl?.value || '').trim();
  fillSelectOptions(mlEntrySubTypeEl, getSubTypeOptions(type, category), defaultSubType);
  updateGuidedItemOptions();
}

function updateGuidedItemOptions(defaultItem = '') {
  const type = normalizeEntryType(mlEntryTypeEl?.value || 'materiel') || 'materiel';
  const category = String(mlEntryCategoryEl?.value || '').trim();
  const subType = String(mlEntrySubTypeEl?.value || '').trim();
  fillSelectOptions(mlEntryItemEl, getItemOptions(type, category, subType), defaultItem);

  const isOther = String(mlEntryItemEl?.value || '') === 'Autre';
  if (mlEntryItemCustomEl) {
    mlEntryItemCustomEl.disabled = !isOther;
    if (!isOther) {
      mlEntryItemCustomEl.value = '';
    }
  }
}

function openMaterialLaborEditor(existingEntry = null, index = -1) {
  const entry = existingEntry || null;
  materialLaborEditingIndex = index;
  materialLaborEditingId = entry?.id || '';

  if (!materialLaborEditorEl) {
    return;
  }

  materialLaborEditorEl.hidden = false;

  if (mlEntryTypeEl) {
    mlEntryTypeEl.value = normalizeEntryType(entry?.type || 'materiel') || 'materiel';
  }

  updateGuidedCategoryOptions(entry?.category || '');
  updateGuidedSubTypeOptions(entry?.subType || '');
  updateGuidedItemOptions(entry?.itemName || '');

  const currentItem = String(entry?.itemName || '').trim();
  const itemOptions = getItemOptions(
    normalizeEntryType(mlEntryTypeEl?.value || 'materiel') || 'materiel',
    String(mlEntryCategoryEl?.value || '').trim(),
    String(mlEntrySubTypeEl?.value || '').trim()
  );

  if (mlEntryItemEl) {
    if (currentItem && itemOptions.includes(currentItem)) {
      mlEntryItemEl.value = currentItem;
      if (mlEntryItemCustomEl) {
        mlEntryItemCustomEl.value = '';
        mlEntryItemCustomEl.disabled = true;
      }
    } else if (currentItem) {
      mlEntryItemEl.value = 'Autre';
      if (mlEntryItemCustomEl) {
        mlEntryItemCustomEl.value = currentItem;
        mlEntryItemCustomEl.disabled = false;
      }
    }
  }

  if (mlEntryQuantityEl) {
    mlEntryQuantityEl.value = formatQty(entry?.quantity || '');
  }

  setMaterialLaborStatus(index >= 0 ? 'Modification d\'entrée en cours.' : 'Ajout d\'entrée en cours.', 'muted');
}

function closeMaterialLaborEditor() {
  materialLaborEditingIndex = -1;
  materialLaborEditingId = '';

  if (materialLaborEditorEl) {
    materialLaborEditorEl.hidden = true;
  }
}

function collectMaterialLaborEntryFromEditor() {
  const type = normalizeEntryType(mlEntryTypeEl?.value || 'materiel') || 'materiel';
  const category = String(mlEntryCategoryEl?.value || '').trim();
  const subType = String(mlEntrySubTypeEl?.value || '').trim();
  const selectedItem = String(mlEntryItemEl?.value || '').trim();
  const customItem = String(mlEntryItemCustomEl?.value || '').trim();
  const itemName = selectedItem === 'Autre' ? customItem : selectedItem;
  const quantity = Number(String(mlEntryQuantityEl?.value || '').replace(',', '.'));

  if (!itemName) {
    window.alert('Veuillez sélectionner ou saisir un élément.');
    return null;
  }

  if (!Number.isFinite(quantity) || quantity <= 0) {
    window.alert('Quantité invalide.');
    return null;
  }

  return {
    id: materialLaborEditingId || `ml_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    type,
    category,
    subType,
    itemName,
    quantity: String(quantity),
    updatedAt: new Date().toISOString(),
    createdAt:
      materialLaborEditingIndex >= 0 && materialLaborEntries[materialLaborEditingIndex]
        ? materialLaborEntries[materialLaborEditingIndex].createdAt
        : new Date().toISOString()
  };
}

function findExistingEntryIndex(nextEntry, ignoreId = '') {
  return materialLaborEntries.findIndex((entry) => {
    if (ignoreId && entry.id === ignoreId) {
      return false;
    }

    return (
      String(entry.type || '').trim() === String(nextEntry.type || '').trim() &&
      String(entry.category || '').trim().toLowerCase() === String(nextEntry.category || '').trim().toLowerCase() &&
      String(entry.subType || '').trim().toLowerCase() === String(nextEntry.subType || '').trim().toLowerCase() &&
      String(entry.itemName || '').trim().toLowerCase() === String(nextEntry.itemName || '').trim().toLowerCase()
    );
  });
}

function renderMaterialLaborEntries() {
  if (!materialLaborEntriesBodyEl) {
    return;
  }

  const hasRows = Array.isArray(materialLaborEntries) && materialLaborEntries.length > 0;
  if (materialLaborEmptyEl) {
    materialLaborEmptyEl.style.display = hasRows ? 'none' : 'block';
  }

  if (!hasRows) {
    materialLaborEntriesBodyEl.innerHTML = '';
    return;
  }

  materialLaborEntriesBodyEl.innerHTML = materialLaborEntries
    .map(
      (entry, index) => `
      <tr>
        <td>${entryTypeLabel(entry.type)}</td>
        <td>${escapeHtmlAttribute(entry.category || '-')}</td>
        <td>${escapeHtmlAttribute(entry.subType || '-')}</td>
        <td>${escapeHtmlAttribute(entry.itemName || '-')}</td>
        <td>${escapeHtmlAttribute(formatQty(entry.quantity))}</td>
        <td>
          <button type="button" class="button-link btn-ghost" data-action="edit-material-labor" data-index="${index}">Modifier</button>
          <button type="button" class="button-link btn-secondary" data-action="delete-material-labor" data-index="${index}">Supprimer</button>
        </td>
      </tr>
    `
    )
    .join('');
}

async function persistMaterialLaborEntries() {
  const payload = {
    entries: materialLaborEntries,
    updatedAt: new Date().toISOString()
  };

  if (window.location.protocol === 'file:' || isDemoProject) {
    if (currentProjectData) {
      currentProjectData.materialLabor = {
        ...(currentProjectData.materialLabor || {}),
        ...payload
      };
    }
    return;
  }

  const result = await apiFetch(`/api/projects/${currentProjectId}/material-labor`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (result?.project) {
    currentProjectData = result.project;
  }
}

async function addMaterialLaborEntry() {
  openMaterialLaborEditor(null, -1);
}

async function editMaterialLaborEntry(index) {
  const entry = materialLaborEntries[index];
  if (!entry) {
    return;
  }

  openMaterialLaborEditor(entry, index);
}

async function deleteMaterialLaborEntry(index) {
  const entry = materialLaborEntries[index];
  if (!entry) {
    return;
  }

  const shouldDelete = window.confirm(`Supprimer l'entrée « ${entry.itemName || 'élément'} » ?`);
  if (!shouldDelete) {
    return;
  }

  materialLaborEntries.splice(index, 1);
  await persistMaterialLaborEntries();
  renderMaterialLaborEntries();
  setMaterialLaborStatus('Entrée supprimée.', 'success');
}

async function saveMaterialLaborEditorEntry() {
  const nextEntry = collectMaterialLaborEntryFromEditor();
  if (!nextEntry) {
    return;
  }

  const editingIndex = materialLaborEditingIndex;
  const existingIndex = findExistingEntryIndex(nextEntry, materialLaborEditingId);

  if (editingIndex < 0) {
    if (existingIndex >= 0) {
      const shouldReplace = window.confirm(
        'Une entrée existe déjà. OK = Mettre à jour cette entrée. Annuler = Ajouter la quantité au total.'
      );

      if (shouldReplace) {
        materialLaborEntries[existingIndex] = {
          ...materialLaborEntries[existingIndex],
          ...nextEntry,
          updatedAt: new Date().toISOString()
        };
        await persistMaterialLaborEntries();
        renderMaterialLaborEntries();
        closeMaterialLaborEditor();
        setMaterialLaborStatus('Entrée mise à jour.', 'success');
        return;
      }

      const mergedQty = Number(materialLaborEntries[existingIndex].quantity || 0) + Number(nextEntry.quantity || 0);
      materialLaborEntries[existingIndex] = {
        ...materialLaborEntries[existingIndex],
        quantity: String(mergedQty),
        updatedAt: new Date().toISOString()
      };
      await persistMaterialLaborEntries();
      renderMaterialLaborEntries();
      closeMaterialLaborEditor();
      setMaterialLaborStatus('Quantité ajoutée au total existant.', 'success');
      return;
    }

    materialLaborEntries.push(nextEntry);
    await persistMaterialLaborEntries();
    renderMaterialLaborEntries();
    closeMaterialLaborEditor();
    setMaterialLaborStatus('Entrée ajoutée.', 'success');
    return;
  }

  if (existingIndex >= 0 && existingIndex !== editingIndex) {
    const shouldReplace = window.confirm(
      'Une autre entrée identique existe. OK = Remplacer l\'autre entrée. Annuler = Cumuler les quantités.'
    );

    if (shouldReplace) {
      materialLaborEntries[existingIndex] = {
        ...materialLaborEntries[existingIndex],
        ...nextEntry,
        updatedAt: new Date().toISOString()
      };
      materialLaborEntries.splice(editingIndex, 1);
    } else {
      const mergedQty = Number(materialLaborEntries[existingIndex].quantity || 0) + Number(nextEntry.quantity || 0);
      materialLaborEntries[existingIndex] = {
        ...materialLaborEntries[existingIndex],
        quantity: String(mergedQty),
        updatedAt: new Date().toISOString()
      };
      materialLaborEntries.splice(editingIndex, 1);
    }
  } else {
    materialLaborEntries[editingIndex] = nextEntry;
  }

  await persistMaterialLaborEntries();
  renderMaterialLaborEntries();
  closeMaterialLaborEditor();
  setMaterialLaborStatus('Entrée modifiée.', 'success');
}

function setProjectInformationStatus(text, kind = 'muted') {
  if (!projectInformationStatusEl) {
    return;
  }

  projectInformationStatusEl.className = kind;
  projectInformationStatusEl.textContent = text;
}

function setAiExportStatus(text, kind = 'muted') {
  if (!aiExportStatusEl) {
    return;
  }

  aiExportStatusEl.className = kind;
  aiExportStatusEl.textContent = text;
}

function getProjectInfoTypeLabel(typeKey) {
  const map = {
    new_construction: 'Construction neuve',
    renovation: 'Rénovation',
    demolition_renovation: 'Démolition / Rénovation',
    small_project: 'Projet'
  };

  return map[String(typeKey || '').trim()] || 'Construction neuve';
}

function getProjectInfoTypeKeyFromProject(project) {
  const info = project?.projectInformation || {};
  const explicitType = String(info.projectType || '').trim();
  if (explicitType) {
    return explicitType;
  }

  return getProjectInfoTypeKey(project?.projectWorkType || 'Construction neuve');
}

function buildLegacyProjectInfoFields(projectInformation = {}) {
  const keys = [
    'propertyType',
    'buildScope',
    'buildingLength',
    'buildingWidth',
    'numberOfStories',
    'basementType',
    'wallHeightBasement',
    'wallHeightMainFloor',
    'wallHeightSecondFloor',
    'wallHeightGarage',
    'hasCathedralCeiling',
    'hasGarage',
    'garageType',
    'garageSize',
    'interiorWallEstimate',
    'studSpacing',
    'wasteFactor',
    'roofStyle',
    'roofPitch',
    'roofMaterial',
    'hasFlatRoof',
    'flooringType',
    'exteriorCladding'
  ];

  const result = {};
  for (const key of keys) {
    const value = projectInformation[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      result[key] = value;
    }
  }

  if (!result.notes && String(projectInformation.clientPreferencesNotes || '').trim()) {
    result.notes = String(projectInformation.clientPreferencesNotes || '').trim();
  }

  return result;
}

function buildStructuredAiPackage(source, framingPreview = {}) {
  const project = source || {};
  const projectInformation = project.projectInformation || {};
  const dynamicFields =
    projectInformation.projectInfo && typeof projectInformation.projectInfo === 'object'
      ? projectInformation.projectInfo
      : null;

  const uniqueProjectInfoFields =
    dynamicFields && Object.keys(dynamicFields).length
      ? dynamicFields
      : buildLegacyProjectInfoFields(projectInformation);

  const projectInfoTypeKey = getProjectInfoTypeKeyFromProject(project);

  return {
    schemaVersion: 'ai-export-v2',
    generatedAt: new Date().toISOString(),
    language: 'fr-CA',
    objective:
      'Valider les informations collectées, analyser le plan PDF et estimer les besoins de bois de charpente.',
    projectContext: {
      id: project.id || 'demo-local',
      estimateNumber: project.estimateNumber || '',
      projectName: project.projectName || '',
      clientName: project.clientName || '',
      projectAddress: project.projectAddress || '',
      projectTypeOverview: project.projectType || '',
      projectTypeWork: project.projectWorkType || getProjectInfoTypeLabel(projectInfoTypeKey),
      status: project.status || ''
    },
    collectedData: {
      contact: project.contact || {},
      location: project.location || {},
      materialLabor: {
        entries: Array.isArray(project.materialLabor?.entries) ? project.materialLabor.entries : []
      },
      projectInformation: {
        typeKey: projectInfoTypeKey,
        typeLabel: getProjectInfoTypeLabel(projectInfoTypeKey),
        fields: uniqueProjectInfoFields
      },
      attachments: {
        architecturalPlanPdf: projectInformation.architecturalPlansFileName || null,
        floorPlanFiles: Array.isArray(projectInformation.floorPlanFileNames)
          ? projectInformation.floorPlanFileNames
          : [],
        pricingDocument: project.profile?.specialPriceListFileName || null,
        planDocuments: Array.isArray(project.profile?.planFileNames) ? project.profile.planFileNames : [],
        aiSupportDocuments: Array.isArray(project.profile?.aiSupportFileNames) ? project.profile.aiSupportFileNames : []
      },
      notes: {
        clientNotes:
          String(uniqueProjectInfoFields.notes || projectInformation.clientPreferencesNotes || '').trim() || null,
        planNotes: String(project.profile?.planNotes || '').trim() || null,
        aiContext: String(project.profile?.aiContextNotes || '').trim() || null,
        pricingNotes: String(project.profile?.specialPriceListsText || '').trim() || null
      }
    },
    framingEstimatePreview: framingPreview,
    analysisRequest: {
      steps: [
        'Valider les données collectées contre le plan PDF.',
        'Identifier les manquants critiques et incohérences.',
        'Appliquer des hypothèses minimales explicites.',
        'Calculer les besoins de bois de charpente (quantités + hypothèses).'
      ],
      outputFormat: {
        validation: 'tableau des champs validés / à corriger',
        missingData: 'liste priorisée',
        assumptions: 'liste claire et justifiée',
        woodTakeoff: 'tableau quantités par élément',
        riskAndConfidence: 'risques + niveau de confiance (%)',
        clientQuestions: 'questions finales avant soumission'
      }
    }
  };
}

function buildLocalAiPackage(project) {
  const source = project || {};
  return buildStructuredAiPackage(source, {
    mode: 'local-demo',
    note: 'Aperçu local. Validation finale à effectuer avec le plan PDF.',
    totalReference: Number(source.total || source.estimate?.total || 0)
  });
}

function buildChatGptPrompt(aiPackage) {
  const pkg = aiPackage || {};

  return [
    'Tu es un estimateur senior en charpente résidentielle au Québec (Outaouais).',
    'Utilise uniquement le JSON structuré ci-dessous + le plan PDF joint.',
    'Règle importante: ne pas dupliquer les informations, référencer les champs tels quels.',
    '',
    'Travail demandé:',
    '1) Validation des données vs plan PDF.',
    '2) Détection des manquants critiques.',
    '3) Hypothèses minimales explicites.',
    '4) Quantification bois de charpente (tableau).',
    '5) Risques + confiance + questions client.',
    '',
    'Format de sortie requis (JSON):',
    '{',
    '  "validation": [],',
    '  "missingData": [],',
    '  "assumptions": [],',
    '  "woodTakeoff": [],',
    '  "riskAndConfidence": {"risks": [], "confidencePercent": 0},',
    '  "clientQuestions": []',
    '}',
    '',
    'PROJECT_ANALYSIS_INPUT_JSON:',
    JSON.stringify(pkg, null, 2)
  ].join('\n');
}

async function generateAiPackage() {
  if (!currentProjectId) {
    setAiExportStatus('Aucun projet sélectionné.', 'error');
    return;
  }

  setAiExportStatus('Génération du dossier IA...', 'muted');

  try {
    let aiPackage;

    if (window.location.protocol === 'file:' || isDemoProject) {
      aiPackage = buildLocalAiPackage(currentProjectData || {});
    } else {
      const result = await apiFetch(`/api/projects/${currentProjectId}/ai-export`);
      aiPackage = result?.aiPackage;
    }

    if (!aiPackage) {
      throw new Error('Impossible de générer le dossier IA.');
    }

    currentAiPackage = aiPackage;
    const prompt = buildChatGptPrompt(aiPackage);

    if (aiPromptOutputEl) {
      aiPromptOutputEl.value = prompt;
    }

    setAiExportStatus('Dossier IA généré. Joignez ensuite le plan PDF dans ChatGPT.', 'success');
  } catch (error) {
    setAiExportStatus(error.message, 'error');
  }
}

async function copyAiPrompt() {
  const value = String(aiPromptOutputEl?.value || '').trim();
  if (!value) {
    setAiExportStatus('Aucun prompt à copier. Générez le dossier IA d\'abord.', 'error');
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    setAiExportStatus('Prompt copié dans le presse-papiers.', 'success');
  } catch {
    setAiExportStatus('Copie impossible. Copiez manuellement le texte affiché.', 'error');
  }
}

function mapProjectInformationPropertyToOverviewType(propertyType) {
  const map = {
    Maison: 'Maison résidentielle',
    'Plex / duplex / triplex': 'Plex',
    Garage: 'Garage',
    Chalet: 'Chalet',
    Agrandissement: 'Autre'
  };

  return map[propertyType] || 'Autre';
}

function updateProjectInformationDependencies() {
  const selectedWorkType = String(projectInfoWorkTypeEl?.value || '').trim();
  const hasWorkType = Boolean(selectedWorkType);
  const projectInfoType = hasWorkType ? getProjectInfoTypeKey(selectedWorkType) : '';

  if (projectInfoPropertyTypeEl) {
    projectInfoPropertyTypeEl.disabled = !hasWorkType || projectInfoType !== 'new_construction';
  }

  if (projectInfoBuildScopeEl) {
    projectInfoBuildScopeEl.disabled = !hasWorkType || projectInfoType !== 'new_construction';
  }

  renderProjectTypeFields(projectInfoType);
  updateProjectInformationHeader(projectInfoType);
}

function updateGarageDependencies() {
  const hasGarage = normalizeYesNo(projectInfoHasGarageEl?.value, 'Non') === 'Oui';

  if (projectInfoGarageTypeEl) {
    projectInfoGarageTypeEl.disabled = !hasGarage;
    if (!hasGarage) {
      projectInfoGarageTypeEl.value = 'Aucun';
    }
  }

  if (projectInfoGarageSizeEl) {
    projectInfoGarageSizeEl.disabled = !hasGarage;
    if (!hasGarage) {
      projectInfoGarageSizeEl.value = '';
    }
  }
}

function getProjectInformationWorkTypeSelection() {
  const selected = String(projectInfoWorkTypeEl?.value || '').trim();
  return PROJECT_WORK_TYPE_OPTIONS.includes(selected) ? selected : '';
}

function syncOverviewTypeFields(projectType, projectWorkType) {
  const overviewTypeSelect = document.getElementById('projectTypeSelect');
  const overviewWorkTypeSelect = document.getElementById('projectWorkTypeSelect');

  if (overviewTypeSelect && projectType) {
    overviewTypeSelect.value = normalizeProjectType(projectType);
  }

  if (overviewWorkTypeSelect && projectWorkType) {
    overviewWorkTypeSelect.value = normalizeProjectWorkType(projectWorkType);
  }
}

function setOverviewStatus(text, kind = 'muted') {
  if (!projectStatusEl) {
    return;
  }

  projectStatusEl.className = kind;
  projectStatusEl.textContent = text;
}

function switchTab(tabName) {
  const isOverview = tabName === 'overview';
  const isLocation = tabName === 'location';
  const isContact = tabName === 'contact';
  const isProjectInformation = tabName === 'project-information';
  const isMaterialLabor = tabName === 'material-labor';

  tabOverviewBtn?.classList.toggle('active', isOverview);
  tabLocationBtn?.classList.toggle('active', isLocation);
  tabContactBtn?.classList.toggle('active', isContact);
  tabProjectInformationBtn?.classList.toggle('active', isProjectInformation);
  tabMaterialLaborBtn?.classList.toggle('active', isMaterialLabor);

  tabOverviewPanel?.classList.toggle('active', isOverview);
  tabLocationPanel?.classList.toggle('active', isLocation);
  tabContactPanel?.classList.toggle('active', isContact);
  tabProjectInformationPanel?.classList.toggle('active', isProjectInformation);
  tabMaterialLaborPanel?.classList.toggle('active', isMaterialLabor);
}

function fileNamesFromInput(inputElement) {
  const files = Array.from(inputElement?.files || []);
  return files.map((file) => file.name);
}

function mergeUniqueNames(savedNames, selectedNames) {
  return [...new Set([...(savedNames || []), ...(selectedNames || [])])];
}

function buildReadinessState() {
  const selectedSpecialPriceFile = specialPriceListFileEl?.files?.[0]?.name || null;
  const selectedPlanNames = fileNamesFromInput(planFilesEl);
  const selectedAiNames = fileNamesFromInput(aiSupportFilesEl);

  const specialPriceText = String(specialPriceListsTextEl?.value || '').trim();
  const planNotesText = String(planNotesEl?.value || '').trim();
  const aiContextText = String(aiContextNotesEl?.value || '').trim();

  const effectiveSpecialPriceFile = selectedSpecialPriceFile || savedSpecialPriceListFileName;
  const effectivePlanNames = mergeUniqueNames(savedPlanFileNames, selectedPlanNames);
  const effectiveAiNames = mergeUniqueNames(savedAiSupportFileNames, selectedAiNames);

  const checks = [
    {
      label: 'Liste de prix spéciale (texte)',
      done: specialPriceText.length > 0,
      weight: 15
    },
    {
      label: 'Fichier de prix spéciale attaché',
      done: Boolean(effectiveSpecialPriceFile),
      weight: 20
    },
    {
      label: 'Au moins un plan attaché',
      done: effectivePlanNames.length > 0,
      weight: 25
    },
    {
      label: 'Notes techniques sur les plans',
      done: planNotesText.length > 0,
      weight: 15
    },
    {
      label: 'Autres documents/supports pour IA',
      done: effectiveAiNames.length > 0,
      weight: 15
    },
    {
      label: 'Contexte d\'analyse IA (texte)',
      done: aiContextText.length > 0,
      weight: 10
    }
  ];

  const score = checks.reduce((sum, check) => sum + (check.done ? check.weight : 0), 0);
  return { checks, score };
}

function readinessLevel(score) {
  if (score >= 80) {
    return 'Élevé';
  }

  if (score >= 50) {
    return 'Moyen';
  }

  return 'Faible';
}

function updateReadinessScore() {
  if (!readinessFillEl || !readinessPercentEl || !readinessLabelEl) {
    return;
  }

  const { checks, score } = buildReadinessState();
  const completedCount = checks.filter((check) => check.done).length;

  readinessFillEl.style.width = `${score}%`;
  readinessPercentEl.textContent = `${score}%`;
  readinessLabelEl.textContent = `Niveau: ${readinessLevel(score)}`;

  if (readinessSummaryEl) {
    readinessSummaryEl.textContent = `${completedCount} critère${completedCount > 1 ? 's' : ''} complété${completedCount > 1 ? 's' : ''} sur ${checks.length}.`;
  }
}

function updateSelectedFileLabels() {
  const specialFile = specialPriceListFileEl?.files?.[0];
  const specialName = specialFile ? specialFile.name : savedSpecialPriceListFileName;
  if (specialPriceFileNameEl) {
    specialPriceFileNameEl.textContent = specialName
      ? `Fichier de prix spécial: ${specialName}`
      : 'Aucun fichier de prix spécial sélectionné.';
  }

  const selectedPlanNames = fileNamesFromInput(planFilesEl);
  const effectivePlanNames = mergeUniqueNames(savedPlanFileNames, selectedPlanNames);
  if (planFilesSelectedEl) {
    planFilesSelectedEl.textContent = effectivePlanNames.length
      ? `Plans: ${effectivePlanNames.join(', ')}`
      : 'Aucun plan sélectionné.';
  }

  const selectedAiNames = fileNamesFromInput(aiSupportFilesEl);
  const effectiveAiNames = mergeUniqueNames(savedAiSupportFileNames, selectedAiNames);
  if (aiSupportFilesSelectedEl) {
    aiSupportFilesSelectedEl.textContent = effectiveAiNames.length
      ? `Éléments IA: ${effectiveAiNames.join(', ')}`
      : 'Aucun élément IA sélectionné.';
  }

  updateReadinessScore();
}

function updateProjectInformationFileLabels() {
  const architecturalPlanFile = projectInfoArchitecturalPlansEl?.files?.[0];
  const architecturalPlanName = architecturalPlanFile
    ? architecturalPlanFile.name
    : savedProjectInfoArchitecturalPlanName;

  if (projectInfoArchitecturalPlansNameEl) {
    projectInfoArchitecturalPlansNameEl.textContent = architecturalPlanName
      ? `Plan architectural: ${architecturalPlanName}`
      : 'Aucun fichier sélectionné.';
  }

  const selectedFloorPlans = fileNamesFromInput(projectInfoFloorPlansEl);
  const effectiveFloorPlans = mergeUniqueNames(savedProjectInfoFloorPlanNames, selectedFloorPlans);

  if (projectInfoFloorPlansNameEl) {
    projectInfoFloorPlansNameEl.textContent = effectiveFloorPlans.length
      ? `Plans d'étage: ${effectiveFloorPlans.join(', ')}`
      : 'Aucun fichier sélectionné.';
  }
}

specialPriceListFileEl?.addEventListener('change', updateSelectedFileLabels);
planFilesEl?.addEventListener('change', updateSelectedFileLabels);
aiSupportFilesEl?.addEventListener('change', updateSelectedFileLabels);
specialPriceListsTextEl?.addEventListener('input', updateReadinessScore);
planNotesEl?.addEventListener('input', updateReadinessScore);
aiContextNotesEl?.addEventListener('input', updateReadinessScore);
projectInfoArchitecturalPlansEl?.addEventListener('change', updateProjectInformationFileLabels);
projectInfoFloorPlansEl?.addEventListener('change', updateProjectInformationFileLabels);
projectInfoWorkTypeEl?.addEventListener('change', updateProjectInformationDependencies);
projectInfoHasGarageEl?.addEventListener('change', updateGarageDependencies);

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

function renderProject(project, isDemo = false) {
  currentProjectData = project;
  const meta = projectMeta(project);
  const estimateNumber = buildEstimateNumber(project);
  const projectStatus = normalizeProjectStatus(project.status);
  const projectType = normalizeProjectType(meta.projectType);
  const projectWorkType = normalizeProjectWorkType(project.projectWorkType);
  const statusOptions = PROJECT_STATUS_OPTIONS.map(
    (status) => `<option value="${status}" ${status === projectStatus ? 'selected' : ''}>${status}</option>`
  ).join('');
  const typeOptions = PROJECT_TYPE_OPTIONS.map(
    (type) => `<option value="${type}" ${type === projectType ? 'selected' : ''}>${type}</option>`
  ).join('');
  const workTypeOptions = PROJECT_WORK_TYPE_OPTIONS.map(
    (type) => `<option value="${type}" ${type === projectWorkType ? 'selected' : ''}>${type}</option>`
  ).join('');

  projectInfoEl.innerHTML = `
    <div class="overview-grid">
      <div class="overview-col">
        <div class="overview-row">
          <p class="overview-label"># de projet</p>
          <input id="overviewEstimateNumber" class="overview-input" type="text" value="${escapeHtmlAttribute(estimateNumber)}" />
        </div>
        <div class="overview-row">
          <p class="overview-label">Nom du projet</p>
          <input id="overviewProjectName" class="overview-input" type="text" value="${escapeHtmlAttribute(meta.projectName)}" />
        </div>
        <div class="overview-row">
          <p class="overview-label">Nom du client</p>
          <input id="overviewClientName" class="overview-input" type="text" value="${escapeHtmlAttribute(meta.clientName)}" />
        </div>
        <div class="overview-row">
          <p class="overview-label">Adresse du projet</p>
          <input id="overviewProjectAddress" class="overview-input" type="text" value="${escapeHtmlAttribute(meta.projectAddress)}" />
        </div>
      </div>

      <div class="overview-col">
        <div class="overview-row">
          <p class="overview-label">Statut du projet</p>
          <select id="projectStatusSelect" class="overview-select" aria-label="Statut du projet">
            ${statusOptions}
          </select>
        </div>
        <div class="overview-row">
          <p class="overview-label">Type de Propriété</p>
          <select id="projectTypeSelect" class="overview-select" aria-label="Type de Propriété">
            ${typeOptions}
          </select>
        </div>
        <div class="overview-row">
          <p class="overview-label">Type de projet</p>
          <select id="projectWorkTypeSelect" class="overview-select" aria-label="Type de projet">
            ${workTypeOptions}
          </select>
        </div>
        <div class="overview-actions">
          <button id="saveOverviewBtn" type="button" class="btn-primary">Enregistrer</button>
        </div>
      </div>
    </div>
  `;

  const projectStatusSelectEl = document.getElementById('projectStatusSelect');
  const projectTypeSelectEl = document.getElementById('projectTypeSelect');
  const projectWorkTypeSelectEl = document.getElementById('projectWorkTypeSelect');
  const saveOverviewBtn = document.getElementById('saveOverviewBtn');
  saveOverviewBtn?.addEventListener('click', async () => {
    const payload = {
      estimateNumber: document.getElementById('overviewEstimateNumber')?.value || estimateNumber,
      projectName: document.getElementById('overviewProjectName')?.value || meta.projectName,
      clientName: document.getElementById('overviewClientName')?.value || meta.clientName,
      projectAddress: document.getElementById('overviewProjectAddress')?.value || meta.projectAddress,
      status: normalizeProjectStatus(projectStatusSelectEl?.value || projectStatus),
      projectType: normalizeProjectType(projectTypeSelectEl?.value || projectType),
      projectWorkType: normalizeProjectWorkType(projectWorkTypeSelectEl?.value || projectWorkType)
    };

    try {
      if (window.location.protocol === 'file:' || isDemo || String(currentProjectId || '').startsWith('demo-')) {
        if (currentProjectData) {
          currentProjectData.estimateNumber = payload.estimateNumber;
          currentProjectData.projectName = payload.projectName;
          currentProjectData.clientName = payload.clientName;
          currentProjectData.projectAddress = payload.projectAddress;
          currentProjectData.status = payload.status;
          currentProjectData.projectType = payload.projectType;
          currentProjectData.projectWorkType = payload.projectWorkType;
        }
        setOverviewStatus('Informations enregistrées en mode démo.', 'success');
        return;
      }

      const result = await apiFetch(`/api/projects/${currentProjectId}/overview`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (result?.project) {
        currentProjectData = result.project;
        projectTitleEl.textContent = result.project.projectName || payload.projectName;
      }

      setOverviewStatus('Informations du projet enregistrées.', 'success');
    } catch (error) {
      setOverviewStatus(error.message, 'error');
    }
  });

  const contact = project.contact || {};
  const location = project.location || {};
  const materialLabor = project.materialLabor || {};
  const projectInformation = project.projectInformation || {};
  contactFullNameEl.value = contact.fullName || meta.clientName || '';
  contactAddressEl.value = contact.address || '';
  contactProjectAddressEl.value = contact.projectAddress || meta.projectAddress || '';
  contactPhoneNumberEl.value = contact.phoneNumber || '';
  contactEmailEl.value = contact.email || '';

  if (locationProjectAddressEl) {
    locationProjectAddressEl.value = location.projectAddress || meta.projectAddress || '';
  }
  if (locationCityEl) {
    locationCityEl.value = location.city || '';
  }
  if (locationProvinceEl) {
    locationProvinceEl.value = location.province || 'QC';
  }
  if (locationPostalCodeEl) {
    locationPostalCodeEl.value = location.postalCode || '';
  }
  if (locationRegionEl) {
    locationRegionEl.value = location.region || 'Outaouais';
  }
  if (locationLotReferenceEl) {
    locationLotReferenceEl.value = location.lotReference || '';
  }
  materialLaborEntries = Array.isArray(materialLabor.entries)
    ? materialLabor.entries.map((entry, index) => ({
        id: entry.id || `ml_existing_${index}`,
        type: normalizeEntryType(entry.type) || 'materiel',
        category: String(entry.category || '').trim(),
        subType: String(entry.subType || '').trim(),
        itemName: String(entry.itemName || '').trim(),
        quantity: formatQty(entry.quantity || 0),
        createdAt: entry.createdAt || new Date().toISOString(),
        updatedAt: entry.updatedAt || new Date().toISOString()
      }))
    : [];
  renderMaterialLaborEntries();
  closeMaterialLaborEditor();

  const savedProjectInfoType = String(projectInformation.projectType || '').trim();
  const existingWorkType = String(project.projectWorkType || '').trim();
  const normalizedWorkType = PROJECT_WORK_TYPE_OPTIONS.includes(existingWorkType)
    ? existingWorkType
    : getWorkTypeFromProjectInfoTypeKey(savedProjectInfoType);

  if (projectInfoWorkTypeEl) {
    projectInfoWorkTypeEl.value = normalizedWorkType;
  }

  const projectInfoType = getProjectInfoTypeKey(normalizedWorkType);
  const legacyNewConstructionData = {
    propertyType: projectInformation.propertyType,
    buildScope: projectInformation.buildScope,
    buildingLength: projectInformation.buildingLength,
    buildingWidth: projectInformation.buildingWidth,
    numberOfStories: projectInformation.numberOfStories,
    basementType: projectInformation.basementType,
    wallHeightBasement: projectInformation.wallHeightBasement,
    wallHeightMainFloor: projectInformation.wallHeightMainFloor,
    wallHeightSecondFloor: projectInformation.wallHeightSecondFloor,
    wallHeightGarage: projectInformation.wallHeightGarage,
    hasCathedralCeiling: projectInformation.hasCathedralCeiling,
    hasGarage: projectInformation.hasGarage,
    garageType: projectInformation.garageType,
    garageSize: projectInformation.garageSize,
    interiorWallEstimate: projectInformation.interiorWallEstimate,
    studSpacing: projectInformation.studSpacing,
    wasteFactor: projectInformation.wasteFactor,
    roofStyle: projectInformation.roofStyle,
    roofPitch: projectInformation.roofPitch,
    roofMaterial: projectInformation.roofMaterial,
    hasFlatRoof: projectInformation.hasFlatRoof,
    flooringType: projectInformation.flooringType,
    exteriorCladding: projectInformation.exteriorCladding,
    notes: projectInformation.clientPreferencesNotes
  };
  const dynamicProjectInfoData =
    projectInformation.projectInfo && typeof projectInformation.projectInfo === 'object'
      ? projectInformation.projectInfo
      : legacyNewConstructionData;

  populateProjectInfo(projectInfoType, dynamicProjectInfoData);

  savedProjectInfoArchitecturalPlanName = projectInformation.architecturalPlansFileName || null;
  savedProjectInfoFloorPlanNames = Array.isArray(projectInformation.floorPlanFileNames)
    ? projectInformation.floorPlanFileNames
    : [];
  updateProjectInformationFileLabels();
  updateProjectInformationDependencies();
  updateGarageDependencies();

  if (project.profile) {
    specialPriceListsTextEl.value = project.profile.specialPriceListsText || '';
    planNotesEl.value = project.profile.planNotes || '';
    aiContextNotesEl.value = project.profile.aiContextNotes || '';

    savedSpecialPriceListFileName = project.profile.specialPriceListFileName || null;
    savedPlanFileNames = Array.isArray(project.profile.planFileNames) ? project.profile.planFileNames : [];
    savedAiSupportFileNames = Array.isArray(project.profile.aiSupportFileNames)
      ? project.profile.aiSupportFileNames
      : [];
  }

  updateSelectedFileLabels();
  updateReadinessScore();
}

async function saveContactInfo() {
  if (!projectContactForm || !currentProjectId) {
    return;
  }

  const payload = {
    fullName: contactFullNameEl.value,
    address: contactAddressEl.value,
    projectAddress: contactProjectAddressEl.value,
    phoneNumber: contactPhoneNumberEl.value,
    email: contactEmailEl.value
  };

  if (window.location.protocol === 'file:' || isDemoProject) {
    setContactStatus('Mode démo: coordonnées enregistrées localement dans la session.', 'success');
    return;
  }

  await apiFetch(`/api/projects/${currentProjectId}/contact`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  setContactStatus('Coordonnées enregistrées.', 'success');
}

async function saveLocationInfo() {
  if (!projectLocationForm || !currentProjectId) {
    return;
  }

  const payload = {
    projectAddress: locationProjectAddressEl?.value || '',
    city: locationCityEl?.value || '',
    province: locationProvinceEl?.value || '',
    postalCode: locationPostalCodeEl?.value || '',
    region: locationRegionEl?.value || '',
    lotReference: locationLotReferenceEl?.value || ''
  };

  if (window.location.protocol === 'file:' || isDemoProject) {
    if (currentProjectData) {
      currentProjectData.location = {
        ...(currentProjectData.location || {}),
        ...payload,
        updatedAt: new Date().toISOString()
      };
      currentProjectData.projectAddress = payload.projectAddress || currentProjectData.projectAddress;
    }

    if (contactProjectAddressEl && payload.projectAddress) {
      contactProjectAddressEl.value = payload.projectAddress;
    }

    setLocationStatus('Localisation enregistrée en mode démo.', 'success');
    return;
  }

  const result = await apiFetch(`/api/projects/${currentProjectId}/location`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (result?.project) {
    currentProjectData = result.project;
    if (contactProjectAddressEl) {
      contactProjectAddressEl.value = result.project.projectAddress || payload.projectAddress;
    }
  }

  setLocationStatus('Localisation enregistrée.', 'success');
}

async function saveProjectInformation() {
  if (!projectInformationForm || !currentProjectId) {
    return;
  }

  const selectedArchitecturalPlan = projectInfoArchitecturalPlansEl?.files?.[0]?.name || null;
  const selectedFloorPlans = fileNamesFromInput(projectInfoFloorPlansEl);

  const selectedWorkType = getProjectInformationWorkTypeSelection();
  if (!selectedWorkType) {
    setProjectInformationStatus('Veuillez d\'abord sélectionner le type de projet.', 'error');
    return;
  }

  const selectedProjectInfoType = getProjectInfoTypeKey(selectedWorkType);
  const projectInfoPayload = getProjectInfoPayload(selectedProjectInfoType);
  const resolvedOverviewProjectType =
    selectedProjectInfoType === 'new_construction'
      ? mapProjectInformationPropertyToOverviewType(projectInfoPayload.propertyType)
      : normalizeProjectType(currentProjectData?.projectType || 'Autre');

  const payload = {
    projectType: selectedProjectInfoType,
    projectInfo: projectInfoPayload,
    projectWorkType: selectedWorkType,
    overviewProjectType: resolvedOverviewProjectType,
    architecturalPlansFileName: selectedArchitecturalPlan || savedProjectInfoArchitecturalPlanName,
    floorPlanFileNames: mergeUniqueNames(savedProjectInfoFloorPlanNames, selectedFloorPlans),
    clientPreferencesNotes: String(projectInfoPayload.notes || '').trim()
  };

  if (window.location.protocol === 'file:' || isDemoProject) {
    if (currentProjectData) {
      currentProjectData.projectInformation = {
        ...(currentProjectData.projectInformation || {}),
        ...payload,
        updatedAt: new Date().toISOString()
      };
      currentProjectData.projectWorkType = payload.projectWorkType;
      currentProjectData.projectType = payload.overviewProjectType;
    }

    savedProjectInfoArchitecturalPlanName = payload.architecturalPlansFileName;
    savedProjectInfoFloorPlanNames = payload.floorPlanFileNames;
    updateProjectInformationFileLabels();
    syncOverviewTypeFields(payload.overviewProjectType, payload.projectWorkType);
    setProjectInformationStatus('Information projet enregistrée en mode démo.', 'success');
    return;
  }

  const result = await apiFetch(`/api/projects/${currentProjectId}/project-information`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (result?.project) {
    currentProjectData = result.project;
    savedProjectInfoArchitecturalPlanName = result.project.projectInformation?.architecturalPlansFileName || null;
    savedProjectInfoFloorPlanNames = Array.isArray(result.project.projectInformation?.floorPlanFileNames)
      ? result.project.projectInformation.floorPlanFileNames
      : [];
    syncOverviewTypeFields(result.project.projectType, result.project.projectWorkType);
  }

  updateProjectInformationFileLabels();
  setProjectInformationStatus('Information projet enregistrée.', 'success');
}

async function saveAttachments(projectId) {
  const selectedSpecialPriceListFile = specialPriceListFileEl?.files?.[0]?.name || null;
  const selectedPlanNames = fileNamesFromInput(planFilesEl);
  const selectedAiSupportNames = fileNamesFromInput(aiSupportFilesEl);

  const payload = {
    specialPriceListsText: specialPriceListsTextEl.value,
    specialPriceListFileName: selectedSpecialPriceListFile || savedSpecialPriceListFileName,
    planFileNames: mergeUniqueNames(savedPlanFileNames, selectedPlanNames),
    planNotes: planNotesEl.value,
    aiSupportFileNames: mergeUniqueNames(savedAiSupportFileNames, selectedAiSupportNames),
    aiContextNotes: aiContextNotesEl.value,

    // Champs legacy gardés pour compatibilité API existante
    planFileName: (selectedPlanNames[0] || savedPlanFileNames[0] || null)
  };

  if (window.location.protocol === 'file:' || projectId.startsWith('demo-')) {
    // Mode démo local sans backend: confirmation UI seulement.
    savedSpecialPriceListFileName = payload.specialPriceListFileName;
    savedPlanFileNames = payload.planFileNames;
    savedAiSupportFileNames = payload.aiSupportFileNames;
    updateSelectedFileLabels();
    setAttachmentStatus('Mode démo: éléments simulés enregistrés localement dans la session.', 'success');
    return;
  }

  await apiFetch(`/api/projects/${projectId}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  savedSpecialPriceListFileName = payload.specialPriceListFileName;
  savedPlanFileNames = payload.planFileNames;
  savedAiSupportFileNames = payload.aiSupportFileNames;
  updateSelectedFileLabels();
  updateReadinessScore();
  setAttachmentStatus('Éléments enregistrés pour support IA/prix.', 'success');
}

async function initProjectPage() {
  const projectId = getQueryParam('projectId');
  currentProjectId = projectId;

  if (projectId && currentProjectSideLinkEl) {
    currentProjectSideLinkEl.href = `project.html?projectId=${encodeURIComponent(projectId)}`;
  }

  tabOverviewBtn?.addEventListener('click', () => switchTab('overview'));
  tabLocationBtn?.addEventListener('click', () => switchTab('location'));
  tabContactBtn?.addEventListener('click', () => switchTab('contact'));
  tabProjectInformationBtn?.addEventListener('click', () => switchTab('project-information'));
  tabMaterialLaborBtn?.addEventListener('click', () => switchTab('material-labor'));
  switchTab('overview');

  projectLocationForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setLocationStatus('Enregistrement de la localisation...', 'muted');

    try {
      await saveLocationInfo();
    } catch (error) {
      setLocationStatus(error.message, 'error');
    }
  });

  projectInformationForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setProjectInformationStatus('Enregistrement de l\'information projet...', 'muted');

    try {
      await saveProjectInformation();
    } catch (error) {
      setProjectInformationStatus(error.message, 'error');
    }
  });

  projectContactForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setContactStatus('Enregistrement des coordonnées...', 'muted');

    try {
      await saveContactInfo();
    } catch (error) {
      setContactStatus(error.message, 'error');
    }
  });

  materialLaborAddEntryBtnEl?.addEventListener('click', async () => {
    setMaterialLaborStatus('Ajout d\'une entrée...', 'muted');
    try {
      await addMaterialLaborEntry();
    } catch (error) {
      setMaterialLaborStatus(error.message, 'error');
    }
  });

  mlEntryTypeEl?.addEventListener('change', () => updateGuidedCategoryOptions());
  mlEntryCategoryEl?.addEventListener('change', () => updateGuidedSubTypeOptions());
  mlEntrySubTypeEl?.addEventListener('change', () => updateGuidedItemOptions());
  mlEntryItemEl?.addEventListener('change', () => updateGuidedItemOptions(mlEntryItemEl.value));

  mlEntrySaveBtnEl?.addEventListener('click', async () => {
    try {
      await saveMaterialLaborEditorEntry();
    } catch (error) {
      setMaterialLaborStatus(error.message, 'error');
    }
  });

  mlEntryCancelBtnEl?.addEventListener('click', () => {
    closeMaterialLaborEditor();
    setMaterialLaborStatus('Saisie annulée.', 'muted');
  });

  materialLaborEntriesBodyEl?.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.dataset.action;
    const index = Number(target.dataset.index || -1);
    if (!Number.isInteger(index) || index < 0) {
      return;
    }

    try {
      if (action === 'edit-material-labor') {
        await editMaterialLaborEntry(index);
      }

      if (action === 'delete-material-labor') {
        await deleteMaterialLaborEntry(index);
      }
    } catch (error) {
      setMaterialLaborStatus(error.message, 'error');
    }
  });

  generateAiPackageBtnEl?.addEventListener('click', generateAiPackage);
  copyAiPromptBtnEl?.addEventListener('click', copyAiPrompt);

  if (!projectId) {
    setStatus('Aucun projet sélectionné.', 'error');
    projectInfoEl.innerHTML = '<p class="muted">Retournez au dashboard pour sélectionner un projet.</p>';
    return;
  }

  // Cas projets démo
  if (DEMO_PROJECTS[projectId]) {
    isDemoProject = true;
    renderProject(completeDemoProject(DEMO_PROJECTS[projectId]), true);
    setStatus('', 'muted');

    attachmentsForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      await saveAttachments(projectId);
    });

    return;
  }

  // Si ouverture locale file:// on n'a pas accès à l'API
  if (window.location.protocol === 'file:') {
    isDemoProject = true;
    setStatus('Mode local sans serveur: projet réel indisponible.', 'error');
    projectInfoEl.innerHTML = '<p class="muted">Démarrez le serveur pour charger ce projet.</p>';
    return;
  }

  setStatus('Chargement du projet...', 'muted');

  try {
    const project = await apiFetch(`/api/projects/${projectId}`);
    isDemoProject = false;
    renderProject(project, false);
    setStatus('Projet chargé.', 'success');

    attachmentsForm?.addEventListener('submit', async (event) => {
      event.preventDefault();
      setAttachmentStatus('Enregistrement des éléments...', 'muted');

      try {
        await saveAttachments(projectId);
      } catch (error) {
        setAttachmentStatus(error.message, 'error');
      }
    });
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

initProjectPage();
