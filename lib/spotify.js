const axios = require('axios');
require('dotenv').config();

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

async function convert(ms) {
    var minutes = Math.floor(ms / 60000);
    var seconds = ((ms % 60000) / 1000).toFixed(0);
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
}

async function spotifyCreds() {
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
            headers: {
                Authorization: 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64')
            }
        });
        return response.data;
    } catch (error) {
        throw new Error('Unable to generate token: ' + error.message);
    }
}

async function getInfo(url) {
    try {
        const creds = await spotifyCreds();
        const response = await axios.get(`https://api.spotify.com/v1/tracks/${url.split('track/')[1]}`, {
            headers: {
                Authorization: 'Bearer ' + creds.access_token
            }
        });
        const data = response.data;
        return {
            data: {
                thumbnail: data.album.images[0].url,
                title: data.artists[0].name + ' - ' + data.name,
                artist: data.artists[0],
                duration: await convert(data.duration_ms),
                preview: data.preview_url
            }
        };
    } catch (error) {
        throw new Error('Unable to fetch track info: ' + error.message);
    }
}

async function searching(query, type = 'track', limit = 20) {
    try {
        const creds = await spotifyCreds();
        const response = await axios.get(`https://api.spotify.com/v1/search`, {
            params: {
                q: query,
                type: type,
                limit: limit
            },
            headers: {
                Authorization: 'Bearer ' + creds.access_token
            }
        });
        const data = response.data.tracks.items;
        return {
            data: data.map(item => ({
                title: item.album.artists[0].name + ' - ' + item.name,
                duration: await convert(item.duration_ms),
                popularity: item.popularity + '%',
                preview: item.preview_url,
                thumbnail: item.album.images[0].url,
                url: item.external_urls.spotify
            }))
        };
    } catch (error) {
        throw new Error('Unable to search tracks: ' + error.message);
    }
}

module.exports = {
    getInfo,
    searching
};
