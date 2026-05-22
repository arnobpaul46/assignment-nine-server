const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
const app = express();
app.use(cors());
const port = process.env.PORT || 8000;


const uri = process.env.MONGODB_URI;

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

    const db = client.db("docappoint");
    const allDoctorsCollection = db.collection('all-doctors')
    // all doctors list
    app.get("/all-doctors", async (req, res) => {
      try {
        
        const result = await allDoctorsCollection.findOne({});

        if (result && result.doctors) {
          res.send(result.doctors); 
        } else {
          res.send([]); 
        }
      } catch (error) {
        res.status(500).send("Server Error");
      }

    })

    






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