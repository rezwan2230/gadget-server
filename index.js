const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 4000;

// //middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

// //mongodb client

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.nvdjbig.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const userCollerction = client.db("gadget-shop").collection("users");
const productCollection = client.db("gadget-shop").collection("products");

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    // get user
    app.get("/user/:email", async (req, res) => {
      const query = { email: req.params.email };
      const user = await userCollerction.findOne(query);
      if (!user) {
        return res.send({ message: "Not Found" });
      }
      res.send(user);
    });



    
    // insert user
    app.post("/users", async (req, res) => {
      const user = req.body;
      //find the accoount by email to see that if the user is exixt before or not.
      const query = { email: user.email };
      const existingUser = await userCollerction.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await userCollerction.insertOne(user);
      res.send(result);
    });

    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// implelmenting jwt
app.post("/authentication", async (req, res) => {
  const userEmail = req.body;
  const token = jwt.sign(userEmail, process.env.ACCESS_KEY_TOKEN, {
    expiresIn: "10d",
  });
  res.send({ token });
});

//api
app.get("/", (req, res) => {
  res.send("Server is running..");
});

app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});
