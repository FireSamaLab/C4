import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "API locale active" });
});

app.post("/api/intake", async (req, res) => {
  try {
    const { userMessage, history = [] } = req.body;

    if (!userMessage || typeof userMessage !== "string") {
      return res.status(400).json({
        error: "Le champ userMessage est requis."
      });
    }

    const input = [
      {
        role: "system",
        content: `
Tu es un assistant d'estimation pour C4 Construction au Québec, principalement en Outaouais.
Tu poses une seule question à la fois pour ouvrir une demande de soumission.
Tu réponds toujours en français.

Tu dois collecter graduellement:
- nom du client
- adresse du projet
- type de projet
- disponibilité des plans
- portée des travaux
- échéancier
- notes utiles

Types de projet possibles:
- petite rénovation
- rénovation majeure
- charpente maison neuve
- projet de charpente
- réclamation assurance

Si le projet est une maison neuve ou un projet majeur, tu dois demander si les plans existent.

Retourne toujours un JSON valide avec:
- reply
- summary
- status

status:
- "question" si une autre question est requise
- "ready" si le dossier est assez complet
`
      },
      ...history,
      {
        role: "user",
        content: userMessage
      }
    ];

    const response = await client.responses.create({
      model: "gpt-4.1",
      input,
      text: {
        format: {
          type: "json_schema",
          name: "construction_intake",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              reply: { type: "string" },
              summary: {
                type: "object",
                additionalProperties: false,
                properties: {
                  client_name: { type: "string" },
                  project_address: { type: "string" },
                  project_type: { type: "string" },
                  plans_available: { type: "string" },
                  scope: { type: "string" },
                  timeline: { type: "string" },
                  notes: { type: "string" }
                },
                required: [
                  "client_name",
                  "project_address",
                  "project_type",
                  "plans_available",
                  "scope",
                  "timeline",
                  "notes"
                ]
              },
              status: {
                type: "string",
                enum: ["question", "ready"]
              }
            },
            required: ["reply", "summary", "status"]
          }
        }
      }
    });

    const parsed = JSON.parse(response.output_text);
    res.json(parsed);
  } catch (error) {
    console.error("Erreur API:", error);
    res.status(500).json({
      error: "Erreur lors de l'appel à OpenAI.",
      details: error?.message || "Erreur inconnue"
    });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});