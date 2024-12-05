const express = require('express')
require('dotenv').config()
var cors = require('cors')
var cookieParser = require('cookie-parser')
var jwt = require('jsonwebtoken');
const app = express()

app.use(cookieParser())

app.use(cors({
    origin: [
        // 'https://messanger-6f9a5.web.app',
        // 'https://messanger-6f9a5.firebaseapp.com',
        // 'http://localhost:5173',
        // 'https://practic-project-501b7.web.app'
        'https://volentear-8e15a.web.app',
        'https://volentear-8e15a.firebaseapp.com'
    ],
    credentials: true
}))


app.use(express.json())

const port = process.env.PORT || 3000

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rylft.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});



async function run() {
    try {

        const database = client.db("test");
        const authUser = database.collection("user");



        app.post('/', async (req, res) => {
            const data = await authUser.insertOne(req.body)
            console.log(data)
            res.send(data)
        })




        // await client.connect();
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})