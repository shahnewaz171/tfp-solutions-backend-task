const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config();

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mkcgo.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productCollection = client.db(`${process.env.DB_NAME}`).collection("products");
    const usersCollection = client.db(`${process.env.DB_NAME}`).collection("users");

    app.get('/products', (req, res) => {
        productCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    })

    app.post('/addProduct', (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        productCollection.insertOne({ title, description, image})
        .then(result => {
            console.log(result);
            res.send(result.insertedCount > 0);
        })
    })

    app.post('/addUser', (req, res) => {
        const email = req.body.email;
        const name = req.body.name;
        const password = req.body.password;

        usersCollection.insertOne({ email, name, password })
        .then(result => {
            console.log(result);
            res.send(result.insertedCount > 0);
        })
    })
    
    app.get('/users', (req, res) => {
        usersCollection.find({})
        .toArray( (err, documents) => {
            res.send(documents);
        })
    })

});

app.get('/', (req, res) => {
    res.send('TFP Solutions')
})


app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})