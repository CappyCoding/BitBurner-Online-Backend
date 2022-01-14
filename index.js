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
        res.status(500).send("error, something went wrong: " + error);
    } finally {
        await client.close();
    }
});

app.post("/userdata/send", async (req, res) => {

    try {
        await client.connect();
        const dataCollect = client.db(dbName).collection(collectionName);

        const db = await dataCollect.findOne({
            serverName: req.body.serverName
        });

        if (db) {
            res.status(400).send("Bad request: user already exists with email:" + req.body.email);
            return;
        }

        let newUser = {
            _id: ObjectId(req.body.id),
            serverName: req.body.serverName,
            serverPassword: await bcrypt.hash(req.body.password, 10),
            userMoney: req.body.userMoney,
            hackingSkill: req.body.hackingSkill,
            isOnline: req.body.isOnline
        }

        let insertData = await dataCollect.insertOne(newUser);

        res.status(201).send(`User Data succesfully saved!`);
        return;

    } catch (err) {
        console.log(err);
        res.status(500).send({
            error: 'Something went wrong',
            value: error
        });
    } finally {
        await client.close();
    }



    // try {
    //     await client.connect();
    //     const collection = client.db(dbName).collection(collectionName);

    //     const match = await collection.findOne({
    //         serverName: req.body.serverName
    //     });

    //     if (match) {
    //         return res.status(400).send("Bad request: Server Name already exists");
    //     } else {

    //         let userData = {
    //             serverName: req.body.serverName,
    //             serverPassword: await bcrypt.hash(req.body.password, 10),
    //             userMoney: req.body.userMoney,
    //             hackingSkill: req.body.hackingSkill,
    //             isOnline: req.body.isOnline
    //         }

    //         let insertUser = await collection.insertOne(userData);
    //         return res.status(201).send("User has been succesfully created");
    //     }
    // } catch (error) {
    //     res.status(500).send("error, something went wrong: " + error);
    // } finally {
    //     await client.close();
    // }
});

app.listen(port, () => {
    console.log(`API running at at http://localhost:${port}`)
});