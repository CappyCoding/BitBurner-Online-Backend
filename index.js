require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
    MongoClient,
    ObjectId
} = require("mongodb");
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const client = new MongoClient(process.env.FINAL_URL);
const app = express();
const port = process.env.PORT;
const dbName = "Bitburner-Online";
const collectionName = "userData";

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get("/", (req, res) => {
    res.status(300).redirect("/api-info.html");
});

app.get("/userdata/get/", async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const col = db.collection(collectionName);
        // const matchID = {
        //     _id: ObjectId(req.params.id)
        // }
        const allUserData = await col.find().toArray();

        console.log(allUserData);

        res.status(200).send(allUserData);

        // const found = await collection.findOne(matchID);
        // if (found) {
        //     res.status(200).send(found);
        //     return
        // } else {
        //     res.status(400).send(`User data not found with id ${req.body.id}`);
        // }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "Something went wrong:",
            value: error
        });
    } finally {
        await client.close();
    }
});

app.post("/userdata/send", async (req, res) => {

    if (!req.body.serverName || !req.body.serverPassword || !req.body.userMoney || !req.body.hackingSkill || !req.body.isOnline) {
        res.status(400).send("Bad request: serverName, serverPassword, userMoney, hackingSkill or isOnline");
        return;
    }

    try {

        await client.connect();
        const collection = client.db(dbName).collection(collectionName);

        let newUser = {
            serverName: req.body.serverName,
            serverPassword: req.body.serverPassword,
            userMoney: req.body.userMoney,
            hackingSkill: req.body.hackingSkill,
            isOnline: req.body.isOnline
        };

        // Validation for duplicates
        const userExists = await collection.findOne({
            serverName: req.body.serverName
        });

        if (userExists) {
            res.status(400).send("Bad request: user already exists with serverName: " + req.body.serverName);
            return;
        }

        // Insert into database
        let insertResult = await collection.insertOne(newUser);
        res.send(201).send(`User succesfully created with serverName: ${req.body.serverName}`);
        return;
    } catch (error) {
        console.log(error);
        res.status(500).send({
            error: "Something went wrong:",
            value: error
        });
    } finally {
        await client.close();
    }
});

app.listen(port, () => {
    console.log(`API running at at http://localhost:${port}`)
});