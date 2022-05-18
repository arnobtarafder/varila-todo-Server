const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jq9bw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      const taskCollection = client.db("taskTaker").collection("tasks");
  
      
      console.log("connected to database");
    } 
    
    finally {

    }
  }
  
  run().catch(console.dir);




app.get("/", (req, res) => {
  res.send("Welcome to Varila To-Do App Server");
});

app.listen(port, () => {
  console.log("Listening to the port:", port);
});