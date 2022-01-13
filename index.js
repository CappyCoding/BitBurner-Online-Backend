const {
    MongoClient,
    ObjectId
} = require("mongodb");
const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const {
    ObjectID
} = require("bson");
const {
    match
} = require("assert");
const app = express();
const port = process.env.PORT || 1337;
const client = new MongoClient(process.env.FINAL_URL);
const dbName = "Bitburner-Online";
const collectionName = "userData";

app.use(express.static('public'));
app.use(bodyParser.json());

//THE FLOODGATES ARE OPEN
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get("/", (req, res) => {
    res.status(300).redirect("/api-info.html");
});

app.listen(port, () => {
    console.log(`API running at at http://localhost:${port}`)
});


app.get("/userdata/get/:id", async (req, res) => {
    try {
        await client.connect();
        const collection = client.db(dbName).collection(collectionName);
        const matchID = {
            _id: ObjectId(req.params.id)
        }
        const found = await collection.findOne(matchID);
        if (found) {
            res.status(200).send(found);
            return
        } else {
            res.status(400).send(`User data not found with id ${req.body.id}`);
        }
    } catch (error) {
        res.status(500).send("error, something went wrong: " + error);
    } finally {
        await client.close();
    }
});

app.post("/userdata/send", async (req, res) => {
    try {
        await client.connect();
        const collection = client.db(dbName).collection(collectionName);

        const match = await collection.findOne({
            serverName: req.body.serverName
        });

        if (match) {
            res.status(400).send("Bad request: Server Name already exists");
            return
        } else {

            let userData = {
                serverName: req.body.serverName,
                serverPassword: await bcrypt.hash(req.body.password, 10),
                userMoney: req.body.userMoney,
                hackingSkill: req.body.hackingSkill,
                isOnline: req.body.isOnline,
            }

            let insertUser = await collection.insertOne(userData);
            res.status(201).send("User has been succesfully created");
            return
        }
    } catch (error) {
        res.status(500).send("error, something went wrong: " + error);
    } finally {
        await client.close();
    }
});