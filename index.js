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


let allDoctorsCollection;
let bookingsCollection;

async function connectDB() {
  try {
    if (!allDoctorsCollection) {
      await client.connect();
      const db = client.db("docappoint");
      allDoctorsCollection = db.collection('all-doctors');
      bookingsCollection = db.collection('bookings');
      console.log("MongoDB Connected!");
    }
  } catch (error) {
    console.error("DB Connection Error:", error);
  }
}


app.use(async (req, res, next) => {
  await connectDB();
  next();
});


app.get('/', (req, res) => {
  res.send('Server is running perfectly!');
});

app.get("/all-doctors", async (req, res) => {
  try {
    const result = await allDoctorsCollection.findOne({});
    res.json(result && result.doctors ? result.doctors : []);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});


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


app.post("/bookings", async (req, res) => {
  try {
    const booking = req.body;
    const result = await bookingsCollection.insertOne(booking);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Booking failed" });
  }
});


app.get("/my-appointments", async (req, res) => {
  try {
    const email = req.query.email;
    const result = await bookingsCollection.find({ userEmail: email }).toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});


app.delete("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});


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


if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}


module.exports = app;