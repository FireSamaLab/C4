/**
 * Importateur RONA (one-shot / manuel)
 * ------------------------------------
 * Objectif MVP:
 * - Télécharger UNE fois la page catégorie RONA fournie
 * - Extraire des infos produit (titre, SKU/article, prix, URL, unité)
 * - Sauvegarder le brut dans data/raw-rona-prices.json
 * - Normaliser les dimensions (ex: 2x4x8) pour data/lumber-prices.json
 *
 * Notes:
 * - Pas de scraping live en continu
 * - Pas de scheduler
 * - Pas d'OpenAI
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fs } from 'fs';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');

const RAW_FILE = path.join(DATA_DIR, 'raw-rona-prices.json');
const CLEAN_FILE = path.join(DATA_DIR, 'lumber-prices.json');

export const DEFAULT_RONA_URL =
  'https://www.rona.ca/webapp/wcs/stores/servlet/CategorySearchDisplay?urlLangId=-2&navDescriptors=&catalogId=10051&pageSize=infinite&page=1&storeId=10151&langId=-2&categoryId=3074457345617090669&content=Products&productCategory=507447';

function cleanText(value) {
  return String(value || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePrice(value) {
  const text = cleanText(value);
  if (!text) {
    return null;
  }

  // Formats visés: "$4.98", "4,98 $", "4.98$"
  const match = text.match(/(?:\$\s*)?(\d+[\.,]\d{2})(?:\s*\$)?/);
  if (!match) {
    return null;
  }

  const normalized = Number(match[1].replace(',', '.'));
  return Number.isFinite(normalized) ? normalized : null;
}

function parseArticleNumber(fullText) {
  const text = cleanText(fullText).toLowerCase();

  const patterns = [
    /(?:no\.?\s*d'?article|article|sku)\s*[:#-]?\s*([a-z0-9-]{4,})/i,
    /#\s*([a-z0-9-]{4,})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return cleanText(match[1]).toUpperCase();
    }
  }

  return null;
}

function parseUnit(titleOrText) {
  const text = cleanText(titleOrText).toLowerCase();

  if (/(\bchaque\b|\bch\b|\/\s*ch\b)/i.test(text)) {
    return 'ch';
  }
  if (/(\bpi\b|\bft\b|\/\s*pi\b|\/\s*ft\b)/i.test(text)) {
    return 'pi';
  }

  return null;
}

function toAbsoluteUrl(sourceUrl, maybeRelative) {
  try {
    if (!maybeRelative) {
      return null;
    }
    return new URL(maybeRelative, sourceUrl).toString();
  } catch {
    return null;
  }
}

function detectNormalizedKeyFromTitle(title) {
  const text = cleanText(title)
    .toLowerCase()
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ');

  // Exemples visés:
  // - 2-po x 4-po x 8-pi
  // - 2-in x 4-in x 8-ft
  // - 2 x 4 x 8
  const patterns = [
    /(\d+(?:\.\d+)?)\s*(?:po|in|\"|')?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:po|in|\"|')?\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:pi|ft|pied|pieds|')?/i,
    /(\d+)\s*[x×]\s*(\d+)\s*[x×]\s*(\d{1,2})/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) {
      continue;
    }

    const width = Math.round(Number(match[1]));
    const height = Math.round(Number(match[2]));
    const length = Math.round(Number(match[3]));

    if (![width, height, length].every((n) => Number.isFinite(n) && n > 0)) {
      continue;
    }

    return `${width}x${height}x${length}`;
  }

  return null;
}

function extractProductsFromHtml(html, sourceUrl) {
  const $ = cheerio.load(html);

  const products = [];
  const seen = new Set();

  // Plusieurs gabarits possibles: on combine des sélecteurs larges.
  const cardSelector = 'article, li, .product-item, .product-card, [data-product-id]';

  $(cardSelector).each((_index, element) => {
    const card = $(element);

    const title = cleanText(
      card.find('h1, h2, h3, .product-title, .product_name, a[title]').first().text() ||
        card.find('a[title]').first().attr('title')
    );

    if (!title || title.length < 5) {
      return;
    }

    const cardText = cleanText(card.text());
    const priceText = cleanText(card.find('[class*="price"], [data-price], .price').first().text()) || cardText;
    const price = parsePrice(priceText);

    // En MVP, on ne garde que les cartes où un prix est détecté.
    if (price === null) {
      return;
    }

    const href = card.find('a[href]').first().attr('href');
    const productUrl = toAbsoluteUrl(sourceUrl, href);

    const sku = parseArticleNumber(cardText);
    const unit = parseUnit(`${title} ${cardText}`);

    const dedupeKey = `${title}__${sku || ''}__${productUrl || ''}`;
    if (seen.has(dedupeKey)) {
      return;
    }
    seen.add(dedupeKey);

    products.push({
      title,
      sku,
      price,
      unit,
      productUrl,
      normalizedKey: detectNormalizedKeyFromTitle(title)
    });
  });

  return products;
}

function buildCleanPrices(products, sourceUrl) {
  const normalized = products.filter((p) => p.normalizedKey && typeof p.price === 'number');

  // Pour chaque clé, on conserve le prix le plus bas détecté pour l'MVP.
  const bestByKey = {};

  for (const product of normalized) {
    const key = product.normalizedKey;
    const existing = bestByKey[key];

    if (!existing || product.price < existing.price) {
      bestByKey[key] = {
        key,
        title: product.title,
        sku: product.sku,
        unit: product.unit || 'ch',
        price: product.price,
        productUrl: product.productUrl,
        source: 'rona-one-time-import'
      };
    }
  }

  return {
    metadata: {
      sourceUrl,
      importedAt: new Date().toISOString(),
      normalizedCount: Object.keys(bestByKey).length,
      note:
        'Fichier de prix normalisé pour estimateur. Les produits non normalisés restent dans raw-rona-prices.json.'
    },
    prices: bestByKey
  };
}

export async function runRonaImport({ sourceUrl = DEFAULT_RONA_URL } = {}) {
  await fs.mkdir(DATA_DIR, { recursive: true });

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'fr-CA,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} lors de la lecture de la page RONA. Le site bloque les requêtes automatisées.`);
    }

    const html = await response.text();
    const products = extractProductsFromHtml(html, sourceUrl);

    const rawPayload = {
      sourceUrl,
      importedAt: new Date().toISOString(),
      productCount: products.length,
      products
    };

    await fs.writeFile(RAW_FILE, JSON.stringify(rawPayload, null, 2), 'utf8');

    const clean = buildCleanPrices(products, sourceUrl);
    await fs.writeFile(CLEAN_FILE, JSON.stringify(clean, null, 2), 'utf8');

    return {
      sourceUrl,
      importedAt: rawPayload.importedAt,
      rawProductCount: products.length,
      normalizedKeyCount: Object.keys(clean.prices).length,
      files: {
        raw: RAW_FILE,
        clean: CLEAN_FILE
      }
    };
  } catch (error) {
    // For MVP, if import fails, we'll keep using manual prices
    console.warn('Import RONA failed:', error.message);
    throw new Error(`Import RONA impossible: ${error.message}. Utilisez la saisie manuelle des prix.`);
  }
}
const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
  : false;

if (isDirectRun) {
  runRonaImport({ sourceUrl: process.env.RONA_CATEGORY_URL || DEFAULT_RONA_URL })
    .then((summary) => {
      console.log('Import RONA terminé.');
      console.log(summary);
    })
    .catch((error) => {
      console.error('Erreur import RONA:', error.message);
      process.exit(1);
    });
}
