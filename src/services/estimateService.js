// Core estimate engine for rectangular new-house framing.
// Assumptions are intentionally simple for MVP and can be improved later.

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clampPositive(value, minValue) {
  if (value < minValue) {
    return minValue;
  }

  return value;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function normalizeAssumptions(input) {
  const houseLength = clampPositive(toNumber(input.houseLength, 0), 1);
  const houseWidth = clampPositive(toNumber(input.houseWidth, 0), 1);
  const numberOfFloors = clampPositive(Math.round(toNumber(input.numberOfFloors, 1)), 1);
  const wallHeight = clampPositive(toNumber(input.wallHeight, 8), 8);
  const studSpacing = clampPositive(toNumber(input.studSpacing, 16), 12);
  const joistSpacing = clampPositive(toNumber(input.joistSpacing, 16), 12);
  const wasteFactor = clampPositive(toNumber(input.wasteFactor, 10), 0);

  return {
    houseLength,
    houseWidth,
    numberOfFloors,
    wallHeight,
    studSpacing,
    joistSpacing,
    wasteFactor
  };
}

function applyWaste(quantity, wasteFactorPercent) {
  const multiplier = 1 + wasteFactorPercent / 100;
  return Math.ceil(quantity * multiplier);
}

function calculateEstimate(assumptions, prices) {
  const a = normalizeAssumptions(assumptions);

  // Basic geometry.
  const perimeter = 2 * (a.houseLength + a.houseWidth);
  const wallAreaAllFloors = perimeter * a.wallHeight * a.numberOfFloors;
  const totalFloorArea = a.houseLength * a.houseWidth * a.numberOfFloors;

  // --- 1) Exterior wall studs (2x4) ---
  // Studs are estimated by perimeter / spacing, plus corner and opening buffer.
  const studsPerFloor = Math.ceil((perimeter * 12) / a.studSpacing) + 8;
  const totalStuds = applyWaste(studsPerFloor * a.numberOfFloors, a.wasteFactor);
  const studUnitPrice = a.wallHeight > 8 ? prices.lumber_2x4x10 : prices.lumber_2x4x8;

  // --- 2) Top and bottom plates (2x4) ---
  // 3 runs per floor: 2 top + 1 bottom.
  const linearFeetPlates = perimeter * a.numberOfFloors * 3;
  const pieces2x4x8ForPlates = Math.ceil(linearFeetPlates / 8);
  const pieces2x4x10ForPlates = Math.ceil(linearFeetPlates / 10);

  // Choose the cheaper plate option by total cost.
  const plateCost8 = pieces2x4x8ForPlates * prices.lumber_2x4x8;
  const plateCost10 = pieces2x4x10ForPlates * prices.lumber_2x4x10;

  const chosenPlatePieceLength = plateCost8 <= plateCost10 ? 8 : 10;
  const basePlateQty = chosenPlatePieceLength === 8 ? pieces2x4x8ForPlates : pieces2x4x10ForPlates;
  const plateQty = applyWaste(basePlateQty, a.wasteFactor);
  const plateUnitPrice = chosenPlatePieceLength === 8 ? prices.lumber_2x4x8 : prices.lumber_2x4x10;

  // --- 3) Floor joists (2x10x12) ---
  // Joists run across width, spaced along length.
  const joistsPerFloor = Math.ceil((a.houseLength * 12) / a.joistSpacing) + 1;
  const twelveFootPiecesPerJoist = Math.ceil(a.houseWidth / 12);
  const totalJoistPieces = applyWaste(
    joistsPerFloor * a.numberOfFloors * twelveFootPiecesPerJoist,
    a.wasteFactor
  );

  // --- 4) Rim boards (2x10x12) ---
  // Rim boards approximate perimeter framing for each floor system.
  const rimLinearFeet = perimeter * a.numberOfFloors;
  const rimBoardQty = applyWaste(Math.ceil(rimLinearFeet / 12), a.wasteFactor);

  // --- 5) Sheathing sheets (OSB) ---
  // Exterior sheathing from wall area, using 4x8 sheets (32 sq.ft).
  const osbSheets = applyWaste(Math.ceil(wallAreaAllFloors / 32), a.wasteFactor);

  // Optional: Plywood subfloor sheets from total floor area.
  const plywoodSheets = applyWaste(Math.ceil(totalFloorArea / 32), a.wasteFactor);

  const items = [
    {
      item: 'Exterior wall studs (2x4)',
      quantity: totalStuds,
      unitPrice: roundMoney(studUnitPrice)
    },
    {
      item: `Top and bottom plates (2x4x${chosenPlatePieceLength})`,
      quantity: plateQty,
      unitPrice: roundMoney(plateUnitPrice)
    },
    {
      item: 'Floor joists (2x10x12)',
      quantity: totalJoistPieces,
      unitPrice: roundMoney(prices.lumber_2x10x12)
    },
    {
      item: 'Rim boards (2x10x12)',
      quantity: rimBoardQty,
      unitPrice: roundMoney(prices.lumber_2x10x12)
    },
    {
      item: 'Sheathing sheets (OSB 4x8)',
      quantity: osbSheets,
      unitPrice: roundMoney(prices.osb_sheet)
    },
    {
      item: 'Subfloor sheets (Plywood 4x8)',
      quantity: plywoodSheets,
      unitPrice: roundMoney(prices.plywood_sheet)
    }
  ].map((row) => ({
    ...row,
    subtotal: roundMoney(row.quantity * row.unitPrice)
  }));

  const totalCost = roundMoney(items.reduce((sum, row) => sum + row.subtotal, 0));

  return {
    assumptionsUsed: a,
    items,
    totalCost,
    generatedAt: new Date().toISOString()
  };
}

module.exports = {
  normalizeAssumptions,
  calculateEstimate
};
