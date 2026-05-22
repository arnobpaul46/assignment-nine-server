const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

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
    const allDoctorsCollection = db.collection('all-doctors');
    const bookingsCollection = db.collection('bookings');

    // all doctor list
    app.get("/all-doctors", async (req, res) => {
      try {
        const result = await allDoctorsCollection.findOne({});
        res.json(result && result.doctors ? result.doctors : []);
      } catch (error) {
        res.status(500).json({ message: "Server Error" });
      }
    });

    // single doctor list
    app.get("/all-doctors/:id", async (req, res) => {
      try {
        const doctorId = req.params.id;
        const result = await allDoctorsCollection.findOne({});
        if (result && result.doctors) {
          const singleDoctor = result.doctors.find(doc => doc.id === doctorId);
          if (singleDoctor) return res.json(singleDoctor);
        }
        res.status(404).json({ message: "Doctor not found" });
      } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
      }
    });

    // appointment booking
    app.post("/bookings", async (req, res) => {
      try {
        const booking = req.body;
        const result = await bookingsCollection.insertOne(booking);
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Booking failed" });
      }
    });

    // all booking section or dashboard er my appointment
    app.get("/my-appointments", async (req, res) => {
      try {
        const email = req.query.email;
        const result = await bookingsCollection.find({ userEmail: email }).toArray();
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Error" });
      }
    });

    // appointment booking cancel or delete
    app.delete("/bookings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Delete failed" });
      }
    });

    // booking update kora
    app.patch("/bookings/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updatedData = req.body;
        const result = await bookingsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: updatedData }
        );
        res.json(result);
      } catch (error) {
        res.status(500).json({ message: "Update failed" });
      }
    });

    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error(error);
  }
}
run().catch(console.dir);

app.get('/', (req, res) => { res.send('Server is running!') });
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}
module.exports = app;