const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const jwt = require('jsonwebtoken');
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send({ message: "Forbidden access" });
      }
      req.decoded = decoded;
      next();
    });
  }
  


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jq9bw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const taskCollection = client.db("taskTaker").collection("tasks");
       
       
        // get all tasks api
        app.get("/tasks", async (req, res) => {
            const query = {};
            const cursor = taskCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        // post single task api
        app.post("/tasks", async (req, res) => {
            const data = req.body;
            const result = await taskCollection.insertOne(data);
            res.send(result);
        });

        app.get("/my-tasks", verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
              const myItems = await taskCollection.find({ email: email }).toArray();
              res.send(myItems);
            } else {
              res.status(403).send({ message: "forbidden access" });
            }
          });

        // post user login information
        app.post("/login", async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
              expiresIn: "1d",
            });
            res.send({ accessToken });
          });


          app.patch("/tasks/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
              $set: { completed: true },
            };
            const result = await taskCollection.updateOne(filter, updateDoc);
            if (result.acknowledged) {
              res.send({ success: true, message: "Task completed" });
            } else {
              res.send({ success: false, message: "Task is not completed" });
            }
          });

        
        // // update task description api
        // app.put("/task/:id", async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const updateDoc = {
        //         $set: { role: "complete" },
        //     };
        //     const result = await taskCollection.updateOne(filter, updateDoc);
        //     res.send(result);
        // });

        // delete a task api
        app.delete("/task/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await taskCollection.deleteOne(filter);
            res.send(result);
        });

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