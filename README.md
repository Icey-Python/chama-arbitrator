# Chama Arbitrator

## The Problem We Are Solving

In Kenya and across East Africa, *Chamas* (informal cooperative societies or investment groups) are a vital financial lifeline. Members pool their resources to invest, save, or lend to each other. However, financial disputes—like a member missing a contribution, disputing a late penalty, or arguing over M-Pesa transaction records—can quickly sour relationships and break apart these tight-knit groups. When conflicts arise, emotions run high.

**Chama Arbitrator** acts as an impartial, AI-powered financial mediator. By uploading the group's rules (Bylaws), M-Pesa transaction statements, and tabular contribution sheets, the agent provides neutral, data-backed arbitration. It removes the emotion from the equation, interpreting rules objectively and cross-referencing them against actual transaction histories to propose fair resolutions and preserve group harmony.

## Agent Architecture

Chama Arbitrator is built around a centralized Intelligence and Mediation Agent leveraging the Gemini API.

- **The Arbitrator Agent**: Once the user uploads the necessary context files (Bylaws, M-Pesa records, Contribution CSVs), this agent ingests the text. It uses Google's Gemini multimodal and long-context capabilities to parse PDF bylaws, extract tabular financial data, and comprehend transaction histories.
- **Communication Flow**: 
  - The frontend React application collects the files and user disputes.
  - An Express-based backend parses the files using `multer` and pipes the extracted text and user prompts to the Gemini API.
  - The Arbitrator Agent processes the chat history, the dispute context, and the financial data.
  - It responds with conversational guidance (supporting English, Swahili, and Sheng) and, when a consensus is reached, outputs a structured JSON `[RESOLUTION_DRAFT]` detailing penalty waivers, extensions, and the reasoning behind the decision.
- **Tools**: Gemini API (for reasoning and document parsing).

## How to Run Locally

You can easily run the application on your local machine:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd chama-arbitrator
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Environment Setup:**
   Create a `.env` file in the root directory and add your Google Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Run the Application:**
   ```bash
   npm run build
   npm run start
   ```
   *Note: In development mode, you can use `npm run dev` to start the app.*
   The application will be accessible at `http://localhost:3000`.

## How to Interact with the Deployed Version

1. Visit the deployed application link (e.g., Google Cloud Run URL).
2. **Setup Phase:** You will be prompted to upload three crucial documents (Sample documents are provided in the `/samples` folder of the repo!):
   - **Constitution & Rules:** The PDF of your group's agreed-upon rules.
   - **M-Pesa Statements:** A PDF of the group's M-Pesa transaction history.
   - **Contribution Sheets:** A CSV file tracking member contributions.
3. Click **Start Arbitration** once all files are uploaded.
4. **Chat Interface:** Describe the dispute (e.g., "Kamau claims he paid his March contribution but was charged a late fee. Check the records.").
5. The Arbitrator Agent will review the records, explain its findings, and propose a structured **Resolution Draft** in the right-hand panel.

## Team Members

- **Sam Kelly** - Fullstack Developer (AI Architecture & Prompt Engineering)
- **Ryan Malawa** - Fullstack Developer (Backend Integration)
- **Abel Misiocha** - Fullstack Developer (Backend Integration)
- **Ian Onyango** - Frontend Developer (Uploads Interface & Validation)
- **Rosedebrah Ojuok** - Frontend Developer (Chat Interface & Core Demo Assets)
