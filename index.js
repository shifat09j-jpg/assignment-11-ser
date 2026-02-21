


const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const Stripe = require("stripe");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster9.jsim6tq.mongodb.net/menu-db?retryWrites=true&w=majority`;

const options = {
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
};

let clientPromise;

if (!global._mongoClientPromise) {

  const client = new MongoClient(uri, options);

  global._mongoClientPromise = client.connect()
    .then(() => {
      console.log("✅ MongoDB Connected");
      return client;
    })
    .catch(err => {
      console.error("❌ MongoDB Error:", err.message);
      throw err;
    });
}

clientPromise = global._mongoClientPromise;

async function getDb() {
  const client = await clientPromise;
  return client.db("menu-db");
}

/* ---------- ROOT ---------- */

app.get("/", (req, res) => {
  res.send("🚀 Server Running Successfully");
});





app.post("/users", async (req, res) => {
  const user = req.body;
  const exists = await usersCollection.findOne({ email: user.email });
  if (exists) return res.json({ message: "User exists" });
  const result = await usersCollection.insertOne(user);
  res.json(result);
});


app.post("/users/google-login", async (req, res) => {
  const user = req.body;
  const exists = await usersCollection.findOne({ email: user.email });
  if (exists) return res.json({ message: "User exists" });
  const result = await usersCollection.insertOne(user);
  res.json(result);
});




app.get("/users/role/:email", async (req, res) => {
  const email = req.params.email;
  const user = await usersCollection.findOne({ email });
  res.json({ role: user?.role });
});


// GET all users
app.get("/users", async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.collection("users").find().toArray();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});




/* Get all meals */
app.get("/meals", async (req, res) => {

  try {

    const db = await getDb();

    const meals = await db.collection("meals")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    res.json(meals);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});


/* Get single meal */
app.get("/meals/:id", async (req, res) => {

  try {

    const db = await getDb();

    const meal = await db.collection("meals").findOne({
      _id: new ObjectId(req.params.id)
    });

    res.json(meal);

  } catch {

    res.status(500).json({ error: "Invalid ID" });

  }

});


/* Add meal (Chef/Admin) */
app.post("/meals", async (req, res) => {

  try {

    const db = await getDb();

    const meal = {
      ...req.body,
      createdAt: new Date()
    };

    const result = await db.collection("meals").insertOne(meal);

    res.json(result);

  } catch {

    res.status(500).json({ error: "Insert failed" });

  }

});






// DELETE a meal by ID
app.delete("/meals/:id", async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection("meals").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete meal" });
  }
});





/* Create order */
app.post("/orders", async (req, res) => {

  try {

    const db = await getDb();

    const order = {
      ...req.body,
      status: "pending",
      createdAt: new Date()
    };

    const result = await db.collection("orders").insertOne(order);

    res.json(result);

  } catch {

    res.status(500).json({ error: "Order failed" });

  }

});


/* Get user orders */
app.get("/orders/user/:email", async (req, res) => {

  const db = await getDb();

  const orders = await db.collection("orders")
    .find({ userEmail: req.params.email })
    .sort({ createdAt: -1 })
    .toArray();

  res.json(orders);

});


/* Update order status */
app.patch("/orders/:id", async (req, res) => {

  const db = await getDb();

  const result = await db.collection("orders").updateOne(
    { _id: new ObjectId(req.params.id) },
    {
      $set: {
        status: "paid",
        paidAt: new Date()
      }
    }
  );

  res.json(result);

});






app.post("/create-checkout-session", async (req, res) => {
  const { foodName, price, orderId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: foodName },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
     
     success_url: `http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: `http://localhost:5173/dashboard/my-orders`,
      metadata: { orderId, foodName, price },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



/* Verify payment and save */
app.post("/verify-and-save-payment", async (req, res) => {

  try {

    const { sessionId, orderId, userEmail } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false });
    }

    const db = await getDb();

    /* Save payment */
    await db.collection("payments").insertOne({

      userEmail,
      orderId,
      transactionId: session.payment_intent,
      amount: session.amount_total / 100,
      date: new Date()

    });


    /* Update order */
    await db.collection("orders").updateOne(

      { _id: new ObjectId(orderId) },

      {
        $set: {
          status: "paid",
          paidAt: new Date()
        }
      }

    );

    res.json({ success: true });

  } catch (error) {

    res.status(500).json({
      success: false,
      error: error.message
    });

  }

});





app.get("/payments/user/:email", async (req, res) => {

  const db = await getDb();

  const payments = await db.collection("payments")
    .find({ userEmail: req.params.email })
    .sort({ date: -1 })
    .toArray();

  res.json(payments);

});




app.listen(port, () => {

  console.log(`🚀 Server running on port ${port}`);

});