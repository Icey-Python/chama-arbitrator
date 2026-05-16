import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  app.use(express.json());

  // Arbitration Endpoint
  app.post("/api/arbitrate", upload.fields([
    { name: 'bylaws', maxCount: 1 },
    { name: 'records', maxCount: 1 },
    { name: 'csv', maxCount: 1 }
  ]), async (req: any, res) => {
    try {
      const { message, chatHistory } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      let contextParts: any[] = [];

      if (files?.bylaws?.[0]) {
        contextParts.push({
          text: `CHAMA BYLAWS:\n${files.bylaws[0].buffer.toString('utf-8')}`
        });
      }

      if (files?.records?.[0]) {
        contextParts.push({
          text: `M-PESA RECORDS:\n${files.records[0].buffer.toString('utf-8')}`
        });
      }

      if (files?.csv?.[0]) {
        contextParts.push({
          text: `CONTRIBUTION CSV RECORDS:\n${files.csv[0].buffer.toString('utf-8')}`
        });
      }

      const systemInstruction = `
        You are "Chama Arbitrator", a professional, fair, and culturally informed AI mediator for Kenyan Chamas.
        Your goal is to resolve member disputes fairly based on:
        1. The provided Chama Bylaws.
        2. Transaction/Contribution records (often in Sheng/Kiswahili or M-Pesa format).
        3. General Kenyan legal and financial norms if bylaws are silent.

        Guidelines:
        - Handle inputs in Sheng, Kiswahili, and English. Respond in the language used by the user or a mix if appropriate.
        - Always cite specific sections from the bylaws if they exist in the context.
        - Be neutral. Don't take sides unless the evidence (records/bylaws) clearly supports one party.
        - If a dispute is heated, use calming language.
        - If records show a missing contribution, point it out politely.

        STRUCTURED RESOLUTION:
        When you reach a conclusion or propose a specific settlement, include a block at the end of your response like this:
        [RESOLUTION_DRAFT]
        {
          "planName": "Name of the plan",
          "penaltyWaived": "YES/NO",
          "extension": "Duration or NONE",
          "nextDue": "Date",
          "summary": "Brief summary"
        }
        [/RESOLUTION_DRAFT]
      `;

      const rawHistory = chatHistory ? JSON.parse(chatHistory) : [];
      const formattedContents = rawHistory.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Add the current user message
      formattedContents.push({ role: 'user', parts: [{ text: message }] });

      // Build the final contents array
      const contents = [];
      if (contextParts.length > 0) {
        contents.push({ role: 'user', parts: contextParts });
      }
      contents.push(...formattedContents);

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Arbitration Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
