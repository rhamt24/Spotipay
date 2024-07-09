const { getInfo } = require('../lib/spotify');

module.exports = async (req, res) => {
    try {
        const url = req.query.url;
        const trackInfo = await getInfo(url);
        res.status(200).json(trackInfo.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
