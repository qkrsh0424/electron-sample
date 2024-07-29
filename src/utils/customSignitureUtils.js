const crypto = require('crypto');

const customSignitureUtils = {
    generateSigniture: (args = { apiKey: null, secretKey: null, timestamp: null }) => {
        return crypto.createHmac('sha256', args?.secretKey)
            .update(args?.apiKey + args?.timestamp)
            .digest('hex');
    },
    makeHeaders: (args = { apiKey, timestamp, signiture }) => {
        return {
            'x-sellertool-apiKey': args?.apiKey,
            'x-sellertool-timestamp': args?.timestamp,
            'x-sellertool-signiture': args?.signiture
        }
    }
}

module.exports = {
    customSignitureUtils
}