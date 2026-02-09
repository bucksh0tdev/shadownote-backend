module.exports = {
    mongodb: process.env.MONGODB_URI || "mongodb://user:pass@host:27017/dbname",
    token: process.env.TELEGRAM_BOT_TOKEN || "000000:example",
    notifyToken: process.env.TELEGRAM_NOTIFY_TOKEN || "000000:example",
    url: process.env.PUBLIC_URL || "https://example.com",
    dev: String(process.env.DEV || "false").toLowerCase() === "true",
    ngrokAuthtoken: process.env.NGROK_AUTHTOKEN || "",
    ngrokDomain: process.env.NGROK_DOMAIN || "",
    port: Number(process.env.PORT || 6060),
    devPort: Number(process.env.DEV_PORT || 80)
};
