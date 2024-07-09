const { searching } = require('../lib/spotify');

module.exports = async (req, res) => {
    try {
        const query = req.query.q;
        const results = await searching(query);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
 
