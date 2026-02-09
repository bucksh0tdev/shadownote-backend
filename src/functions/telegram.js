const TelegramBot = require("node-telegram-bot-api");
const bucksh0t = new (require("../functions/index.js"))();

module.exports = () => {
    const bot = new TelegramBot(bucksh0t.config.token, { polling: true });

    bot.setMyCommands([
        {
            command: "start",
            description: "Start the bot"
        }
    ]);

    bot.on("message", async (msg) => {
        if(msg?.text == "/start") {
            await bucksh0t.message(msg?.chat?.id, `Merhaba ${msg?.from?.first_name}!\nArkadaşlarını davet et ve birlikte bu heyecan verici oyunda yarışarak harika ödüller kazanın! Her davet ettiğin arkadaş sana ekstra bonuslar kazandıracak. Üstelik, arkadaşlarının davet ederek daha hızlı ilerleyebilir ve büyük ödüllerin sahibi olabilirsiniz. Bu maceraya katıl ve arkadaşlarınla birlikte eğlencenin tadını çıkar!`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Oyunu Başlat 🌟",
                                web_app: {
                                    url: `${bucksh0t?.config?.url}`
                                }
                            }
                        ]
                    ]
                }
            });
        }
    });
}
