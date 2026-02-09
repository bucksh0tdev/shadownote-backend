const TelegramBot = require("node-telegram-bot-api");
const bucksh0t = new (require("../functions/index.js"))();

module.exports = (wss) => {
    const bot = new TelegramBot(bucksh0t.config.notifyToken, { polling: true });

    bot.on("message", async (msg) => {
        if(String(msg?.text) == String("/stop")) {
            let isAdmin = await bucksh0t.database("all", "users", { type: 3, id: String(msg?.from?.id) });
            if(isAdmin.length == 0) return;
            await bucksh0t.notify("Sunucu Yeniden Başlatılıyor...", msg?.chat?.id);
            process.exit(1);
        } else if(String(msg?.text) == String("/status")) {
            let isAdmin = await bucksh0t.database("all", "users", { type: 3, id: String(msg?.from?.id) });
            if(isAdmin.length == 0) return;

            let getAllUsers = await bucksh0t.database("all", "users");
            return bucksh0t.notify(`Total registered user: ${getAllUsers.length} | Now connected users: ${wss.clients.size}`, msg?.chat?.id);
        } 
    });
}
