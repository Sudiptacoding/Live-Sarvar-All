const express = require('express');
require('dotenv').config();
const cors = require('cors');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rylft.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        const database = client.db("test");
        const videoCollection = database.collection("videos");
        const services = database.collection("services");

        app.post('/api/uploadVideo', async (req, res) => {
            try {
                const { youtubeUrl } = req.body;
                console.log(youtubeUrl);

                // Check if the URL matches the standard YouTube URL format
                const youtubePattern = /https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/;
                const match = youtubeUrl.match(youtubePattern);

                if (match) {
                    // Extract the video ID from the URL
                    const videoId = match[1];

                    // Create the embed URL
                    const embedUrl = `https://www.youtube.com/embed/${videoId}`;

                    // Save the embed URL in the database
                    const result = await videoCollection.insertOne({ youtubeUrl: embedUrl });

                    res.status(201).send({ message: 'Video URL uploaded successfully', result });
                } else {
                    return res.status(400).send({ message: 'Invalid YouTube URL format' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Error uploading video', error });
            }
        });





        // READ: Get all video URLs
        app.get('/api/videos', async (req, res) => {
            try {
                const videos = await videoCollection.find({}).toArray();
                res.status(200).json(videos);
            } catch (error) {
                res.status(500).send({ message: 'Error fetching videos', error });
            }
        });


        // UPDATE: Update an existing YouTube embed URL
        app.put('/api/updateVideo/:id', async (req, res) => {
            const { id } = req.params;
            const { youtubeUrl } = req.body;

            try {
                if (!youtubeUrl || !youtubeUrl.includes('https://www.youtube.com/embed/')) {
                    return res.status(400).send({ message: 'Invalid YouTube URL' });
                }

                const result = await videoCollection.updateOne(
                    { _id: new ObjectId(id) },
                    { $set: { youtubeUrl } }
                );

                if (result.modifiedCount > 0) {
                    res.status(200).send({ message: 'Video URL updated successfully' });
                } else {
                    res.status(404).send({ message: 'Video not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Error updating video', error });
            }
        });

        // DELETE: Delete a video URL by ID
        app.delete('/api/deleteVideo/:id', async (req, res) => {
            const { id } = req.params;
            try {
                const result = await videoCollection.deleteOne({ _id: new ObjectId(id) });

                if (result.deletedCount > 0) {
                    res.status(200).send({ message: 'Video URL deleted successfully' });
                } else {
                    res.status(404).send({ message: 'Video not found' });
                }
            } catch (error) {
                res.status(500).send({ message: 'Error deleting video', error });
            }
        });





        app.post('/api/uploadText', async (req, res) => {
            try {
                const { title, description } = req.body;

                // Check if title and description are provided
                if (!title || !description) {
                    return res.status(400).send({ message: 'Title and description are required.' });
                }

                // Insert the text data into the collection (using plain MongoDB)
                const result = await services.insertOne({ title, description });

                res.status(201).send({ message: 'Text uploaded successfully', result });
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: 'Error uploading text', error });
            }
        });

        app.get('/api/uploadText', async (req, res) => {
            try {
                const result = await services.find({}).toArray();
                res.status(201).send(result);
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: 'Error uploading text', error });
            }
        });



        // DELETE: Delete text by ID
        app.delete('/api/deleteText/:id', async (req, res) => {
            try {
                const { id } = req.params;
                // Delete the text document from the collection
                const result = await services.deleteOne({ _id: new ObjectId(id) });

                if (result.deletedCount === 0) {
                    return res.status(404).send({ message: 'Text not found' });
                }

                res.status(200).send({ message: 'Text deleted successfully', result });
            } catch (error) {
                console.error(error);
                res.status(500).send({ message: 'Error deleting text', error });
            }
        });






    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

run().catch(console.error);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
