const express = require('express');
const ejs = require('ejs');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const marked = require('marked');
require('dotenv').config();
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} = require("@google/generative-ai");

const chatList = {};

// Discord oAuth2 Configuration
const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const redirectUri = process.env.DISCORD_REDIRECT_URI;

// Gemini AI Configuration
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const instructionPath = path.join(__dirname, 'instruction.dat');
const systemInstruction = fs.readFileSync(instructionPath, 'utf8');
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    systemInstruction,
});

const generationConfig = {
    temperature: 0.8,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

// Internal Functions
function removeKeyInPlace(obj, keyToRemove) {
    if (obj.hasOwnProperty(keyToRemove)) {
      delete obj[keyToRemove];
    }
}

async function generateReply(chatId, prompt) {
    const chatSession = model.startChat({
        generationConfig,
        history: chatList[chatId]['history'],
    });

    const result = await chatSession.sendMessage(prompt);
    const response = result.response.text();

    return response;
}

async function getUserData(token) {
    try {
        const response = await axios.get('https://discord.com/api/v10/users/@me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (err) {
        console.error('Error fetching user data', err);
        return null;
    }
}

function generateChatID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let sequence = '';
    for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        sequence += characters[randomIndex];
    }
    return sequence;
}

// Express Server Configuration
const app = express();
app.use(express.static(path.join(__dirname, '/public')));
app.set('views', __dirname + '/pages');
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

function isAuthenticated(req, res, next) {
    const { xAuthToken } = req.cookies;
    if (!xAuthToken) {
        return next();
    }

    getUserData(xAuthToken)
        .then((userData) => {
            if (userData) {
                return res.redirect('/chat');
            }
            res.clearCookie('xAuthToken');
            next();
        })
        .catch((err) => {
            console.error('Erro ao verificar autenticação:', err);
            res.clearCookie('xAuthToken');
            next();
        });
}

// Server Routes
app.get('/chat', async (req, res) => {
    const { xAuthToken } = req.cookies;
    const { id } = req.query;

    if (!xAuthToken) {
        return res.redirect('/login');
    }

    try {
        const userData = await getUserData(xAuthToken);

        if (userData) {
            let chatInfo = {
                history: [],
                author: userData.username,
            };

            if (id && chatList[id]) {
                chatInfo = {
                    history: chatList[id].history,
                    author: chatList[id].author
                };
            }

            res.render('chat', {
                user: {
                    avatar: `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}`,
                    name: userData.username,
                    gName: userData.global_name,
                    email: userData.email
                },
                chatInfo,
                marked
            });
        } else {
            res.clearCookie('xAuthToken');
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        res.clearCookie('xAuthToken');
        res.redirect('/login');
    }
});

app.get('/login', isAuthenticated, async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.redirect(`https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify+email`);
    }

    axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
        'client_id': clientId,
        'client_secret': clientSecret,
        'code': code,
        'grant_type': 'authorization_code',
        'redirect_uri': redirectUri,
        'scope': 'identify email',
    }).toString(), {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }).then((response) => {
        const { access_token } = response.data;

        res.cookie('xAuthToken', access_token, { httpOnly: true });

        res.redirect('/chat');
    }).catch((err) => {
        console.error('Error getting access token', err);
        res.redirect('/login');
    });
});

app.get('/logout', (req, res) => {
    res.clearCookie('xAuthToken');
    res.redirect('/');
});

app.post('/api/generate', async (req, res) => {
    const { xAuthToken } = req.cookies;
    const { prompt } = req.body;
    const { chatId } = req.query;

    if (!xAuthToken) {
        return res.status(401).json({ 'status': 401, 'message': 'Unauthorized' });
    }

    try {
        const userData = await getUserData(xAuthToken);

        if (userData) {
            if (chatId) {
                if (chatList[chatId]) {
                    if (chatList[chatId]['author'] !== userData.username) {
                        return res.status(403).json({ 'status': 403, 'message': 'Forbidden' });
                    }

                    const response = await generateReply(chatId, prompt);

                    return res.status(200).json({ 'status': 200, 'message': response, 'chatId': chatId });
                } else {
                    return res.status(404).json({ 'status': 404, 'message': 'Not Found' });
                }
            } else {
                const newChatId = generateChatID();
                chatList[newChatId] = {
                    history: [],
                    author: userData.username,
                };

                const response = await generateReply(newChatId, prompt);

                return res.status(200).json({ 'status': 200, 'message': response, 'chatId': newChatId });
            }
        } else {
            return res.status(401).json({ 'status': 401, 'message': 'Unauthorized' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'status': 500, 'message': 'Internal Server Error' });
    }
});

app.post('/api/deleteChat', async (req, res) => {
    const { xAuthToken } = req.cookies;
    const { chatId } = req.query;

    if (!xAuthToken) {
        return res.status(401).json({ 'status': 401, 'message': 'Unauthorized' });
    }

    try {
        const userData = await getUserData(xAuthToken);

        if (userData) {
            if (chatId) {
                if (chatList[chatId]) {
                    if (chatList[chatId]['author'] !== userData.username) {
                        return res.status(403).json({ 'status': 403, 'message': 'Forbidden' });
                    }

                    removeKeyInPlace(chatList, chatId);

                    return res.status(200).json({ 'status': 200});
                } else {
                    return res.status(404).json({ 'status': 404, 'message': 'Not Found' });
                }
            }
        } else {
            return res.status(401).json({ 'status': 401, 'message': 'Unauthorized' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ 'status': 500, 'message': 'Internal Server Error' });
    }
});

app.get('/api/chats', (req, res) => {
    res.json(chatList);
});

app.use((req, res, next) => {
    if (req.method === "GET") {
        res.redirect('/');
    } else {
        next();
    }
});

app.listen(3666, () => {
    console.log('Hosted in http://localhost:3666/');
});
