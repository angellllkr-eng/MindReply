// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock Database
let credits = 5;

// 1. Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'MindReply', credits: credits });
});

// 2. MRagent Endpoint
app.post('/api/agent/chat', async (req, res) => {
    const { message, category } = req.body;
    
    // Simulate AI thinking time
    await new Promise(r => setTimeout(r, 1000));

    const responses = {
        'restructuring': "An exquisite question. For restructuring communications, I recommend a framework of transparent intention + empathetic validation + future-oriented reassurance.",
        'default': "I observe you seek to refine professional correspondence. I recommend focusing on 'subconscious clarity' and 'trust resonance' for this specific context."
    };

    credits -= 1; // Deduct credit

    res.json({
        response: responses[category] || responses['default'],
        analysis: {
            clarity: 96,
            trustResonance: 92,
            persuasiveSubtext: 89
        },
        remainingCredits: credits
    });
});

// 3. Micro-Tools Endpoint
app.post('/api/tools/use', (req, res) => {
    const { toolName, input } = req.body;
    const costs = { 'Text Refiner': 1, 'Email Polisher': 2, 'Call Scripter': 2 };
    const cost = costs[toolName] || 1;

    if (credits < cost) {
        return res.status(402).json({ error: 'Insufficient credits' });
    }

    credits -= cost;
    
    // Simulate tool processing
    let result = input;
    if (toolName === 'Email Polisher') {
        result = `[Professional Subject]: Regarding Our Strategic Alignment\n\nDear Colleague,\n\n${input}\n\nBest regards,\n[Your Name]`;
    }

    res.json({ result, remainingCredits: credits });
});

// 4. Premium Access Request
app.post('/api/membership/request', (req, res) => {
    res.json({ success: true, message: 'Our membership team will contact you within 24 hours.' });
});

app.listen(PORT, () => {
    console.log(`🚀 MindReply API running on port ${PORT}`);
});
