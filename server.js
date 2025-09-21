// server.js

const express = require('express');
const OpenAI = require('openai');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

// --- Setup OpenAI Client ---
if (!process.env.OPENAI_API_KEY) {
    console.error('FATAL ERROR: OPENAI_API_KEY is not defined in your .env file.');
    process.exit(1);
}
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Path Configuration ---
// This assumes server.js is at /Users/Olivier/Desktop/TBD-Hackathon/server.js
// We get the directory name and use it as the project root.
const projectRoot = path.dirname(__filename);
const incidentsFilePath = path.join(projectRoot, 'incidents.json');

console.log('--- Server Path Diagnostics ---');
console.log(`Server script is running from (__dirname): ${__dirname}`);
console.log(`Calculated project root directory: ${projectRoot}`);
console.log(`Attempting to read incidents.json from: ${incidentsFilePath}`);
console.log('-------------------------------');


// --- Serve the Front-End Files ---
app.use(express.static(projectRoot));

// --- The Main AI Endpoint ---
app.post('/ask-ai', async (req, res) => {
    const userQuery = req.body.query;

    if (!userQuery) {
        return res.status(400).json({ error: 'Query is required.' });
    }

    try {
        const incidentsData = await fs.readFile(incidentsFilePath, 'utf-8');

        const systemMessage = `You are a helpful AI assistant for an emergency response command center named "Crisis Watch AI".
        Your task is to answer questions based ONLY on the provided JSON data about current incidents.
        Be concise, professional, and do not provide information that isn't in the data. Do not make up information.
        If the user asks a general question not related to the data, politely state that you can only answer questions about the incident data.
        Today's date is ${new Date().toLocaleDateString()}.`;

        const userMessage = `Here is the current incident data in JSON format:
        ---
        ${incidentsData}
        ---
        Now, please answer this user's question: "${userQuery}"`;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage }
            ],
            temperature: 0.1,
            max_tokens: 150,
        });

        const aiResponse = completion.choices[0].message.content;
        res.json({ answer: aiResponse });

    } catch (error) {
        console.error("Error communicating with OpenAI or reading file:", error);
        res.status(500).json({ error: 'Failed to get a response from the AI. Check the server logs for details.' });
    }
});

// --- Default route to serve your main page ---
app.get('/', (req, res) => {
    res.sendFile(path.join(projectRoot, 'landingpage.html'));
});

app.listen(port, () => {
    console.log(`🚀 Crisis Watch Server is now live!`);
    console.log(`➡️ Open your browser and go to: http://localhost:${port}`);
    console.log('----------------------------------------------------');
});