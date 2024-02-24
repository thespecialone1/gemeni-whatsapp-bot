const { Client } = require('whatsapp-web.js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const qrcode = require('qrcode-terminal');

dotenv.config();
const client = new Client({
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Access you API
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Event listeners:
//  - for when the client is ready
client.on('qr', (qr) => {
    // Generate and display QR code
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code to log in.');
});

//    when the qrcode is scanned
client.on('ready', () => {
    console.log('WhatsApp Bot is ready!');
});

//     for incoming messages
client.on('message', async (msg) => {
    // Check if the message starts with '#'
    if (msg.body.startsWith('#')) {
        // Get the content of the message (excluding '#')
        const prompt = msg.body.slice(1);

        try {
            // Get the Generative Model (gemini-pro) for text-only input
            const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

            // Generate content based on the prompt
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = await response.text();

            // Send the generated content as a reply to the user
            await client.sendMessage(msg.from, text);
        } catch (error) {
            console.error('Error generating content:', error);
            // Send an error message to the user if there's an issue with generating content
            await client.sendMessage(msg.from, 'Sorry, an error occurred while generating content.');
        }
    }
});

// Start the WhatsApp client
client.initialize();
