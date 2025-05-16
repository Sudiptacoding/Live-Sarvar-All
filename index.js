const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qrqdszn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// MongoClient setup
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const database = client.db("Fakesarver");
    const Projects = database.collection("portfolioproject");

    // GET all projects
    app.get("/project", async (req, res) => {
      const portfolioProjects = await Projects.find({}).toArray();
      res.status(200).json(portfolioProjects);
    });

    // POST a new project
    app.post("/project", async (req, res) => {
      const newProject = req.body;
      const result = await Projects.insertOne(newProject);
      res.status(201).json(result);
    });

    app.delete("/project/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await Projects.deleteOne(query);
      res.status(200).json(result);
    });

    
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

// Root Route
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
