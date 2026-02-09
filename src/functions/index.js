const axios = require("axios");
const path = require("path");
const fs = require("fs");
const md5 = require("md5");
const unique = require("short-unique-id");
const genid = new unique({ length: 12 }).randomUUID;
const crypto = require("crypto");

const nextcryptr = (config) => import("next-cryptr").then(({ NextCryptr }) => new NextCryptr(config));
module.exports = function() {
    this.config = require("../config.js");
    this.api = `https://api.telegram.org/bot${this.config?.token}`;
    this.notifyApi = `https://api.telegram.org/bot${this.config?.notifyToken}`;

    this.database = async function (type, mymodel, data = {}, extra = {}) {
        let getmodel = require(`../databases/${mymodel}.js`);
        if(type == "create") {
            const doc = await getmodel.findOne(data).lean();
            if (doc) {
                return doc;
            } else {
                var docc = await getmodel.create(data);
                return docc;
            }
        } else if (type == "delete") {
            await getmodel.deleteOne(data);
            return;
        } else if (type == "update") {
            const doc = await getmodel.findOneAndUpdate(extra, data);
            if (doc) {
                return doc;
            } else {
                return false;
            }
        } else if (type == "get") {
            const doc = await getmodel.findOne(data, extra).lean();
            if(doc) {
                return {...doc};
            } else { 
                return null; 
            }
        } else if (type == "all") {
            const projection = extra?.projection || {}; 
            const sort = extra?.sort || null;

            let query = getmodel.find(data, projection);

            if (sort) query = query.sort(sort);

            const cursor = query.cursor();

            let res = [];
            for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
                res.push(doc);
            }
            
            return res || null;
        } else if (type == "sort") {
            const sorted = await getmodel.aggregate(data);
            return sorted || [];
        }
    }

    this.message = async(chat, message, options = {}) => {
        return await axios.post(`${this.api}/sendMessage`, { 
            chat_id: String(chat),
            text: String(message),
            ...options
        }).catch(err => false);
    }

    this.decryptor = async(data) => {
        return new Promise(async(res) => {
            if(!data) return res(false);
        
            var dataRes = false;
            var error = false;
        
            try {
                dataRes = JSON.parse(data);
            } catch (err) {
                err + "1";
                error = true;
            }
    
            if(error || !dataRes) return res(false);
            return res(dataRes);
        });
    }

    this.user = async(id) => {
        let getUser = await this.database("get", "users", { id: String(id) });
        if(!getUser) return false;

        let allinvites = await this.database("all", "friends", { invited: String(getUser?.id) });

        return {
            id: String(getUser?.id),
            username: String(getUser?.username),
            type: Number(getUser?.type),
            avatar: String(getUser?.avatar),
            price: Number(getUser?.price) || 0,
            sort: Number(getUser?.sort) || 0,
            invited: Number(allinvites.length)
        };
    }

    this.id = () => {
        return String(md5(genid(12)));
    }
}