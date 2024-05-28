const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CALLBACK_URL = process.env.CALLBACK_URL;

app.get('/auth', (req, res) => {
    const authUrl = `https://oauth.pipedrive.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${CALLBACK_URL}`;
    res.redirect(authUrl);
});

app.get('/api/auth/callback', async (req, res) => {
    const { code } = req.query;
    try {
        const response = await axios.post('https://oauth.pipedrive.com/oauth/token', {
            grant_type: 'authorization_code',
            code,
            redirect_uri: CALLBACK_URL,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
        });

        const { access_token } = response.data;
        // Store the access_token in your database or session
        res.json({ access_token });
    } catch (error) {
        console.error('Error during OAuth callback', error);
        res.status(500).send('Authentication failed');
    }
});

app.post('/api/deals', async (req, res) => {
    const { accessToken, dealData } = req.body;
    try {
        const response = await axios.post('https://api.pipedrive.com/v1/deals', dealData, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error creating deal', error);
        res.status(500).send('Failed to create deal');
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
