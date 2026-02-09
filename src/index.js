require("dotenv").config();
const express = require("express");
const userAgent = require("express-useragent");
const mongoose = require("mongoose");
const requestIp = require("request-ip");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const ngrok = require("@ngrok/ngrok");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const bucksh0t = new (require("./functions/index.js"))();
const start = async() => {
    mongoose.set('strictQuery', true);
    await mongoose.connect(bucksh0t.config.mongodb).catch(err => {
        console.log(err)
        console.log("Error Connecting database");
        process.exit(1)
    });
    console.log("Connected to the database");

    const app = express();
    const server = http.createServer(app);
    const wss = new WebSocket.Server({ noServer: true });

    require("./modules/websocket.js")(server, wss);
    if(!bucksh0t.config.dev) {
        require("./functions/telegram.js")(wss);
        require("./functions/notify.js")(wss);
    }

    app.use(cors());
    app.use(requestIp.mw());
    app.use(userAgent.express());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.disable("x-powered-by");

    let moduleFiles = await fs.readdirSync(path.join(__dirname, "/modules"));
    for(var moduleFile of moduleFiles) {
        var moduleName = String(moduleFile).split(".")[0];
        if(!moduleName.includes("websocket"))
        app.use(`/${moduleName}`, require(`./modules/${moduleName}.js`));
    }

    app.use(express.static(path.join(__dirname, "/game")));

    app.use((req, res, next) => {
        res.status(404).json({ code: 404, message: "Not Found" });
    });
      
    app.use((req, res, next) => {
        res.status(500).json({ code: 404, message: "Not Found" });
    });

    if(bucksh0t.config.dev) {
        server.listen(bucksh0t.config.devPort);
        if (bucksh0t.config.ngrokAuthtoken && bucksh0t.config.ngrokDomain) {
            ngrok.connect({ addr: bucksh0t.config.devPort, domain: bucksh0t.config.ngrokDomain, authtoken: bucksh0t.config.ngrokAuthtoken })
                .then(listener => console.log(`Ingress established at: ${listener.url()}`));
        }
    } else {
        server.listen(bucksh0t.config.port);
    }
}

if(!bucksh0t.config.dev) {
    setInterval(() => {
        process.exit(1);
    }, 1 * 60 * 60 * 1000);
}

start();
