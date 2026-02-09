const bucksh0t = new (require("../functions/index.js"))();

const activeUsers = new Map();
const rateLimiter = new Map();

function checkRateLimit(ip, limit, perMs) {
    const now = Date.now();

    if (!rateLimiter.has(ip)) {
        rateLimiter.set(ip, { count: 1, lastReset: now });
        return false;
    }

    const data = rateLimiter.get(ip);

    if (now - data.lastReset > perMs) {
        data.count = 1;
        data.lastReset = now;
        return false;
    }

    data.count++;

    return data.count > limit;
}

module.exports = (server, wss) => {
    wss.on("connection", (ws, req) => {
        let ip = req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;

        const send = (message) => {
            try { ws.send(JSON.stringify(message)); } 
            catch (err) { console.error("Send error:", err); }
        };

        
        ws.on("message", async (hash) => {
            const message = await bucksh0t.decryptor(hash);

            if (message?.type === "login" && message?.fingerprint) {

                ws._id = Math.random().toString(36).substring(2) + new Date().getTime();
                activeUsers.set(ws._id, {
                    ip,
                    fingerprint: message?.fingerprint
                });

                send({ code: 200 })
            } else if(message?.type === "ping") {
                if(!activeUsers.has(ws?._id)) return;

                let comments = await bucksh0t.database("all", "comments", { type: 1 }, {
                    projection: {
                        _id: 0,
                        id: 1,
                        content: 1,
                        likes: 1,
                        dislikes: 1,
                        views: 1,
                        date: 1
                    },
                    sort: { date: -1 },
                    limit: 500
                });

                let popular = [...comments].sort((a, b) => b?.likes - a?.likes).slice(0, 10);

                send({
                    code: 201,
                    comments,
                    popular,
                    onlines: activeUsers.size + 238
                });
            } else if(message?.type === "send" && message?.content) {
                if(!activeUsers.has(ws?._id)) return;

                if (checkRateLimit(ip, 3, 60000)) {
                    send({ code: 999, type: "error", message: "Bir dakikada 3 kez itiraf yapabilirsiniz." });
                    return;
                }

                if (String(message?.content).length > 700) {
                    send({ code: 999, type: "error", message: "İtiraf 700 karakterden fazla olamaz." });
                    return;
                }

                if (String(message?.content).length < 20) {
                    send({ code: 999, type: "error", message: "İtiraf 20 karakterden az olamaz." });
                    return;
                }

                await bucksh0t.database("create", "comments", { 
                    id: bucksh0t.id(),
                    type: 1,
                    fingerprint: activeUsers.get(ws?._id)?.fingerprint,
                    content: String(message?.content),
                    ip: ip,
                    date: new Date().getTime()
                });

                send({ code: 999, type: "success", message: "İtiraf Yayınlandı!" });
            } else if (message?.type === "like" && message?.id) {
                if (!activeUsers.has(ws?._id)) return;

                let already = await bucksh0t.database("get", "votes", { ip, comment: message?.id });

                if (already && already?.type === "like") {
                    send({ code: 999, type: "error", message: "Zaten beğenmişsin." });
                    return;
                }

                if (already && already.type === "dislike") {
                    await bucksh0t.database("delete", "votes", { ip, comment: message?.id });

                    await bucksh0t.database("update", "comments", { $inc: { dislikes: -1 } }, { id: String(message?.id) });
                }

                await bucksh0t.database("create", "votes", {
                    id: bucksh0t.id(),
                    comment: String(message?.id),
                    fingerprint: activeUsers.get(ws?._id)?.fingerprint,
                    ip,
                    type: "like",
                    date: new Date().getTime()
                });

                await bucksh0t.database("update", "comments", { $inc: { likes: 1 } }, { id: String(message?.id) });

                send({ code: 999, type: "success", message: "Beğenildi!" });

            } else if (message?.type === "dislike" && message?.id) {
                if (!activeUsers.has(ws?._id)) return;

                let already = await bucksh0t.database("get", "votes", { ip, comment: message?.id });

                if (already && already?.type === "dislike") {
                    send({ code: 999, type: "error", message: "Zaten beğenmeme yapmışsın." });
                    return;
                }

                if (already && already.type === "like") {
                    await bucksh0t.database("delete", "votes", { ip, comment: message?.id });

                    await bucksh0t.database("update", "comments", { $inc: { likes: -1 } }, { id: String(message?.id) });
                }

                await bucksh0t.database("create", "votes", {
                    id: bucksh0t.id(),
                    comment: String(message?.id),
                    fingerprint: activeUsers.get(ws?._id)?.fingerprint,
                    ip,
                    type: "dislike",
                    date: new Date().getTime()
                });

                await bucksh0t.database("update", "comments", { $inc: { dislikes: 1 } }, { id: String(message?.id) });

                send({ code: 999, type: "success", message: "Beğenmeme kaydedildi!" });
            }

        });

        ws.on("close", () => {
            console.log("[-] Kullanıcı ayrıldı:", ws._id);
            activeUsers.delete(ws._id);
        });
    });

    server.on("upgrade", (request, socket, head) => {
        if (request.url === "/websocket") {
            wss.handleUpgrade(request, socket, head, (ws) =>
                wss.emit("connection", ws, request)
            );
        } else {
            socket.destroy();
        }
    });
};
