# Chama Arbitrator

An impartial financial resolution AI agent designed for Chamas (informal cooperative societies/investment groups). 

Provide your group's documents to start the mediation process. The agent acts neutrally, analyzing the provided bylaws and financial records to produce unbiased, data-backed arbitration, helping resolve financial disputes and keep the peace in your group.

## Features

- **Document Ingestion**: Upload group rules (Constitution/Bylaws), M-Pesa transaction statements, and tabular contribution records (CSV) to ground the AI.
- **AI-Powered Mediation**: Chat with an AI agent which parses through your provided documents, identifying facts and timelines to guide resolution.
- **Structured Resolution Draft**: Generates concrete plans including penalty waivers, extensions, and next-due dates based on the financial context.
- **Mobile-Responsive Interface**: A clean, distraction-free environment across mobile and desktop devices.
- **Sheng & Swahili Support**: Native understanding of Kenyan regional contexts and group dynamics context.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Tabler Icons, Framer Motion
- **Backend / API**: Express, Multer (for file uploads)
- **AI Services**: Google GenAI SDK (Gemini)

## Getting Started

1. Clone or download the repository.
2. Install the necessary dependencies via `npm install`.
3. Provide your `GEMINI_API_KEY` in the environment to enable the arbitration agent.
4. Run the development server with `npm run dev`.
