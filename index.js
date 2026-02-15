// const express = require("express");
// const cors = require("cors");
// const { MongoClient, ObjectId } = require("mongodb");
// require("dotenv").config();
// const Stripe = require("stripe");

// const app = express();
// const port = process.env.PORT || 3000;

// // --------- MIDDLEWARE ----------
// app.use(cors());
// app.use(express.json());

// // --------- STRIPE ----------
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// // --------- MONGODB ----------
// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster9.jsim6tq.mongodb.net/?retryWrites=true&w=majority`;
// const client = new MongoClient(uri);

// let mealCollection, orderCollection, paymentCollection;

// async function connectDB() {
//   try {
//     // await client.connect();
//     const db = client.db("menu-db");
//     mealCollection = db.collection("meals");
//     orderCollection = db.collection("orders");
//     paymentCollection = db.collection("payments");
//     console.log("✅ MongoDB Connected");
//   } catch (err) {
//     console.log("❌ DB Error:", err);
//   }
// }
// connectDB();

// // ---------------- ROUTES ----------------

// // Test route
// app.get("/", (req, res) => res.send("Server Running ✅"));

// // ---------------- MEALS ----------------
// app.get("/meals", async (req, res) => {
//   const { chefId } = req.query;
//   let query = chefId ? { chefId } : {};
//   const result = await mealCollection.find(query).toArray();
//   res.send(result);
// });

// app.get("/meals/:id", async (req, res) => {
//   const meal = await mealCollection.findOne({ _id: new ObjectId(req.params.id) });
//   if (!meal) return res.status(404).send({ message: "Meal not found" });
//   res.send(meal);
// });

// app.post("/meals", async (req, res) => {
//   const result = await mealCollection.insertOne(req.body);
//   res.send({ message: "Meal added", mealId: result.insertedId });
// });

// // ---------------- ORDERS ----------------
// app.post("/orders", async (req, res) => {
//   const { email, foodId, foodName, price } = req.body;
//   if (!email || !foodId || !foodName || !price) return res.status(400).send({ error: "Missing order info" });

//   const order = { email, foodId, foodName, price, paid: false, transactionId: null, date: new Date() };
//   const result = await orderCollection.insertOne(order);
//   res.send({ message: "Order created", orderId: result.insertedId });
// });

// app.get("/orders/:id", async (req, res) => {
//   const order = await orderCollection.findOne({ _id: new ObjectId(req.params.id) });
//   if (!order) return res.status(404).send({ message: "Order not found" });
//   res.send(order);
// });

// // ---------------- STRIPE CHECKOUT ----------------
// app.post("/create-checkout-session", async (req, res) => {
//   const { price, foodName, orderId } = req.body;
//   if (!price || !foodName || !orderId) return res.status(400).send({ error: "Missing info for checkout" });

//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: { name: foodName },
//             unit_amount: price * 100, // amount in cents
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: `http://localhost:5173/payment-success/${orderId}`,
//       cancel_url: `http://localhost:5173/payment/${orderId}`,
//     });

//     res.send({ url: session.url });
//   } catch (err) {
//     res.status(500).send({ error: err.message });
//   }
// });

// // ---------------- PAYMENTS ----------------
// app.post("/payments", async (req, res) => {
//   const { email, foodName, price, transactionId, orderId } = req.body;
//   if (!email || !transactionId || !orderId) return res.status(400).send({ error: "Missing payment info" });

//   try {
//     // Save payment
//     const paymentResult = await paymentCollection.insertOne({ email, foodName, price, transactionId, date: new Date() });

//     // Update order as paid
//     const orderResult = await orderCollection.updateOne(
//       { _id: new ObjectId(orderId) },
//       { $set: { paid: true, transactionId } }
//     );

//     res.send({ message: "Payment recorded", paymentResult, orderResult });
//   } catch (err) {
//     res.status(500).send({ error: err.message });
//   }
// });

// // ---------------- PAYMENT HISTORY ----------------
// app.get("/payments", async (req, res) => {
//   const email = req.query.email;
//   if (!email) return res.status(400).send({ error: "Email required" });

//   try {
//     const result = await paymentCollection.find({ email }).toArray();
//     res.send(result);
//   } catch (err) {
//     res.status(500).send({ error: err.message });
//   }
// });

// // ---------------- START SERVER ----------------
// app.listen(port, () => console.log(`🚀 Server running on port ${port}`));



const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const Stripe = require("stripe");

const app = express();
const port = process.env.PORT || 3000;

/* ---------- MIDDLEWARE ---------- */
app.use(cors());
app.use(express.json());

/* ---------- STRIPE ---------- */
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ---------- MONGODB ---------- */
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster9.jsim6tq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

let mealCollection;
let orderCollection;
let paymentCollection;
let isConnected = false;

/* ---------- DB CONNECT ---------- */
async function connectDB() {
  try {
    if (!isConnected) {
      await client.connect(); // ✅ Safe for Vercel
      isConnected = true;
      console.log("✅ MongoDB Connected");
    }

    const db = client.db("menu-db");

    mealCollection = db.collection("meals");
    orderCollection = db.collection("orders");
    paymentCollection = db.collection("payments");

  } catch (error) {
    console.log("❌ DB Error:", error);
  }
}

connectDB();

/* ---------- ROUTES ---------- */

// Test Route
app.get("/", (req, res) => {
  res.send("🚀 Server Running Successfully!");
});


/* ---------- MEALS ---------- */

// Get All Meals
app.get("/meals", async (req, res) => {
  try {
    const { chefId } = req.query;

    const query = chefId ? { chefId } : {};

    const result = await mealCollection.find(query).toArray();

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Failed to load meals" });
  }
});


// Get Single Meal
app.get("/meals/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await mealCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).send({ message: "Meal Not Found" });
    }

    res.send(result);
  } catch (error) {
    res.status(500).send({ error: "Invalid ID" });
  }
});


// Add Meal
app.post("/meals", async (req, res) => {
  try {
    const meal = req.body;

    const result = await mealCollection.insertOne(meal);

    res.send({
      message: "Meal Added Successfully",
      id: result.insertedId,
    });

  } catch (error) {
    res.status(500).send({ error: "Failed to add meal" });
  }
});


/* ---------- ORDERS ---------- */

// Create Order
app.post("/orders", async (req, res) => {
  try {
    const { email, foodId, foodName, price } = req.body;

    if (!email || !foodId || !foodName || !price) {
      return res.status(400).send({ error: "Missing Info" });
    }

    const order = {
      email,
      foodId,
      foodName,
      price,
      paid: false,
      transactionId: null,
      date: new Date(),
    };

    const result = await orderCollection.insertOne(order);

    res.send({
      message: "Order Created",
      orderId: result.insertedId,
    });

  } catch (error) {
    res.status(500).send({ error: "Order Failed" });
  }
});


// Get Single Order
app.get("/orders/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const result = await orderCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).send({ message: "Order Not Found" });
    }

    res.send(result);

  } catch (error) {
    res.status(500).send({ error: "Invalid Order ID" });
  }
});


/* ---------- STRIPE ---------- */

app.post("/create-checkout-session", async (req, res) => {
  try {
    const { price, foodName, orderId } = req.body;

    if (!price || !foodName || !orderId) {
      return res.status(400).send({ error: "Missing Info" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: foodName,
            },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],

      mode: "payment",

      success_url: `https://your-frontend.vercel.app/payment-success/${orderId}`,
      cancel_url: `https://your-frontend.vercel.app/payment/${orderId}`,
    });

    res.send({ url: session.url });

  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


/* ---------- PAYMENTS ---------- */

// Save Payment
app.post("/payments", async (req, res) => {
  try {
    const { email, foodName, price, transactionId, orderId } = req.body;

    if (!email || !transactionId || !orderId) {
      return res.status(400).send({ error: "Missing Payment Info" });
    }

    const payment = {
      email,
      foodName,
      price,
      transactionId,
      date: new Date(),
    };

    const paymentResult = await paymentCollection.insertOne(payment);

    const orderResult = await orderCollection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $set: {
          paid: true,
          transactionId,
        },
      }
    );

    res.send({
      message: "Payment Success",
      paymentResult,
      orderResult,
    });

  } catch (error) {
    res.status(500).send({ error: "Payment Failed" });
  }
});


/* ---------- PAYMENT HISTORY ---------- */

app.get("/payments", async (req, res) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).send({ error: "Email Required" });
    }

    const result = await paymentCollection
      .find({ email })
      .toArray();

    res.send(result);

  } catch (error) {
    res.status(500).send({ error: "Failed to Load Payments" });
  }
});


/* ---------- SERVER ---------- */

app.listen(port, () => {
  console.log(`🚀 Server Running on Port ${port}`);
});
