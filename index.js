

// /* ---------- STRIPE ---------- */

// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const { price, foodName, orderId } = req.body;

//     if (!price || !foodName || !orderId) {
//       return res.status(400).send({ error: "Missing Info" });
//     }

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],

//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: foodName,
//             },
//             unit_amount: price * 100,
//           },
//           quantity: 1,
//         },
//       ],

//       mode: "payment",

//       success_url: `https://your-frontend.vercel.app/payment-success/${orderId}`,
//       cancel_url: `https://your-frontend.vercel.app/payment/${orderId}`,
//     });

//     res.send({ url: session.url });

//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });


// /* ---------- PAYMENTS ---------- */

// // Save Payment
// app.post("/payments", async (req, res) => {
//   try {
//     const { email, foodName, price, transactionId, orderId } = req.body;

//     if (!email || !transactionId || !orderId) {
//       return res.status(400).send({ error: "Missing Payment Info" });
//     }

//     const payment = {
//       email,
//       foodName,
//       price,
//       transactionId,
//       date: new Date(),
//     };

//     const paymentResult = await paymentCollection.insertOne(payment);

//     const orderResult = await orderCollection.updateOne(
//       { _id: new ObjectId(orderId) },
//       {
//         $set: {
//           paid: true,
//           transactionId,
//         },
//       }
//     );

//     res.send({
//       message: "Payment Success",
//       paymentResult,
//       orderResult,
//     });

//   } catch (error) {
//     res.status(500).send({ error: "Payment Failed" });
//   }
// });


// /* ---------- PAYMENT HISTORY ---------- */

// app.get("/payments", async (req, res) => {
//   try {
//     const email = req.query.email;

//     if (!email) {
//       return res.status(400).send({ error: "Email Required" });
//     }

//     const result = await paymentCollection
//       .find({ email })
//       .toArray();

//     res.send(result);

//   } catch (error) {
//     res.status(500).send({ error: "Failed to Load Payments" });
//   }
// });


// /* ---------- SERVER ---------- */

// app.listen(port, () => {
//   console.log(`🚀 Server Running on Port ${port}`);
// });

// const express = require("express");
// const cors = require("cors");
// const { MongoClient, ObjectId } = require("mongodb");
// require("dotenv").config();
// const Stripe = require("stripe");

// const app = express();
// const port = process.env.PORT || 3000;

// /* ---------- MIDDLEWARE ---------- */
// app.use(cors());
// app.use(express.json());

// /* ---------- DEBUG ENV ---------- */
// console.log("DB USER:", process.env.DB_USERNAME);
// console.log("DB PASS:", process.env.DB_PASSWORD ? "LOADED" : "NOT FOUND");
// console.log("STRIPE:", process.env.STRIPE_SECRET_KEY ? "LOADED" : "NOT FOUND");

// /* ---------- STRIPE ---------- */
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// /* ---------- MONGODB URI ---------- */
// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster9.jsim6tq.mongodb.net/menu-db?retryWrites=true&w=majority`;

// /* ---------- MONGO CLIENT ---------- */
// const client = new MongoClient(uri, {
//   serverSelectionTimeoutMS: 5000,
// });

// /* ---------- COLLECTIONS ---------- */
// let mealCollection;
// let orderCollection;
// let paymentCollection;
// let isConnected = false;

// /* ---------- CONNECT DB ---------- */
// async function connectDB() {
//   if (isConnected) return;

//   try {
//     await client.connect();

//     const db = client.db("menu-db");

//     mealCollection = db.collection("meals");
//     orderCollection = db.collection("orders");
//     paymentCollection = db.collection("payments");

//     isConnected = true;

//     console.log("✅ MongoDB Connected Successfully");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Failed:");
//     console.error(error.message);
//     throw error;
//   }
// }

// /* ---------- ROOT ---------- */

// app.get("/", (req, res) => {
//   res.send("🚀 Server Running Successfully!");
// });

// /* ---------- MEALS ---------- */

// app.get("/meals", async (req, res) => {
//   try {
//     await connectDB();

//     const result = await mealCollection.find().toArray();

//     res.send(result);
//   } catch (error) {
//     console.error("Meals Error:", error.message);

//     res.status(500).send({
//       error: "Database Connection Failed",
//     });
//   }
// });

// /* ---------- SINGLE MEAL ---------- */

// app.get("/meals/:id", async (req, res) => {
//   try {
//     await connectDB();

//     const result = await mealCollection.findOne({
//       _id: new ObjectId(req.params.id),
//     });

//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ error: "Invalid ID" });
//   }
// });

// /* ---------- ADD MEAL ---------- */

// app.post("/meals", async (req, res) => {
//   try {
//     await connectDB();

//     const result = await mealCollection.insertOne(req.body);

//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ error: "Insert Failed" });
//   }
// });

// /* ---------- ORDERS ---------- */

// app.post("/orders", async (req, res) => {
//   try {
//     await connectDB();

//     const result = await orderCollection.insertOne(req.body);

//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ error: "Order Failed" });
//   }
// });

// /* ---------- STRIPE ---------- */

// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],

//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: req.body.foodName,
//             },
//             unit_amount: req.body.price * 100,
//           },
//           quantity: 1,
//         },
//       ],

//       mode: "payment",

//       success_url: "http://localhost:5173/success",
//       cancel_url: "http://localhost:5173/cancel",
//     });

//     res.send({ url: session.url });
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });

// /* ---------- PAYMENTS ---------- */

// app.post("/payments", async (req, res) => {
//   try {
//     await connectDB();

//     const result = await paymentCollection.insertOne(req.body);

//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ error: "Payment Failed" });
//   }
// });

// /* ---------- START SERVER ---------- */

// app.listen(port, () => {
//   console.log(`🚀 Server Running on Port ${port}`);
// });


// const express = require("express");
// const cors = require("cors");
// const { MongoClient, ObjectId } = require("mongodb");
// require("dotenv").config();
// const Stripe = require("stripe");

// const app = express();
// const port = process.env.PORT || 3000;

// /* ---------- MIDDLEWARE ---------- */
// app.use(cors());
// app.use(express.json());

// /* ---------- DEBUG ENV ---------- */
// console.log("DB USER:", process.env.DB_USERNAME);
// console.log("DB PASS:", process.env.DB_PASSWORD ? "LOADED" : "NOT FOUND");
// console.log("STRIPE:", process.env.STRIPE_SECRET_KEY ? "LOADED" : "NOT FOUND");

// /* ---------- STRIPE ---------- */
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// /* ---------- MONGODB URI ---------- */
// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster9.jsim6tq.mongodb.net/menu-db?retryWrites=true&w=majority`;

// /* ---------- MONGO CLIENT ---------- */
// const client = new MongoClient(uri, {
//   serverSelectionTimeoutMS: 5000,
// });

// /* ---------- COLLECTIONS ---------- */
// let mealCollection;
// let orderCollection;
// let paymentCollection;
// let isConnected = false;

// /* ---------- CONNECT DB ---------- */
// async function connectDB() {
//   if (isConnected) return;

//   try {
//     await client.connect();

//     const db = client.db("menu-db");

//     mealCollection = db.collection("meals");
//     orderCollection = db.collection("orders");
//     paymentCollection = db.collection("payments");

//     isConnected = true;

//     console.log("✅ MongoDB Connected Successfully");
//   } catch (error) {
//     console.error("❌ MongoDB Connection Failed:");
//     console.error(error.message);
//     throw error;
//   }
// }

// /* ---------- CONNECT ONCE ---------- */
// connectDB().catch(console.error);

// /* ---------- ROOT ---------- */

// app.get("/", (req, res) => {
//   res.send("🚀 Server Running Successfully!");
// });

// /* ---------- MEALS ---------- */

// app.get("/meals", async (req, res) => {
//   try {
//     const result = await mealCollection.find().toArray();
//     res.send(result);
//   } catch (error) {
//     console.error("Meals Error:", error.message);

//     res.status(500).send({
//       error: "Database Connection Failed",
//     });
//   }
// });

// /* ---------- SINGLE MEAL ---------- */

// app.get("/meals/:id", async (req, res) => {
//   try {
//     const result = await mealCollection.findOne({
//       _id: new ObjectId(req.params.id),
//     });

//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ error: "Invalid ID" });
//   }
// });

// /* ---------- ADD MEAL ---------- */

// app.post("/meals", async (req, res) => {
//   try {
//     const result = await mealCollection.insertOne(req.body);
//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ error: "Insert Failed" });
//   }
// });

// /* ---------- ORDERS ---------- */

// app.post("/orders", async (req, res) => {
//   try {
//     const result = await orderCollection.insertOne(req.body);
//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ error: "Order Failed" });
//   }
// });

// /* ---------- STRIPE ---------- */

// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],

//       line_items: [
//         {
//           price_data: {
//             currency: "usd",
//             product_data: {
//               name: req.body.foodName,
//             },
//             unit_amount: req.body.price * 100,
//           },
//           quantity: 1,
//         },
//       ],

//       mode: "payment",

//       // success_url: "http://localhost:5173/success",
//       // cancel_url: "http://localhost:5173/cancel",

//       success_url: "https://capable-muffin-3d81c8.netlify.app/payment-success",
//       cancel_url: "https://capable-muffin-3d81c8.netlify.app/cancel",

//     });

//     res.send({ url: session.url });
//   } catch (error) {
//     res.status(500).send({ error: error.message });
//   }
// });

// /* ---------- PAYMENTS ---------- */

// app.post("/payments", async (req, res) => {
//   try {
//     const result = await paymentCollection.insertOne(req.body);
//     res.send(result);
//   } catch (error) {
//     res.status(500).send({ error: "Payment Failed" });
//   }
// });

// /* ---------- START SERVER ---------- */

// app.listen(port, () => {
//   console.log(`🚀 Server Running on Port ${port}`);
// });


// const express = require("express");
// const cors = require("cors");
// const { MongoClient, ObjectId } = require("mongodb");
// require("dotenv").config();
// const Stripe = require("stripe");

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(cors());
// app.use(express.json());

// console.log("DB USER:", process.env.DB_USERNAME);
// console.log("DB PASS:", process.env.DB_PASSWORD ? "LOADED" : "NOT FOUND");
// console.log("STRIPE:", process.env.STRIPE_SECRET_KEY ? "LOADED" : "NOT FOUND");

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// /* ---------- FIXED MONGODB URI + OPTIONS ---------- */
// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster9.jsim6tq.mongodb.net/menu-db?retryWrites=true&w=majority`;

// const options = {
//   connectTimeoutMS: 30000,
//   serverSelectionTimeoutMS: 30000,  // ← এটা বাড়ানো (5000 থেকে 30000) — cold start fix
//   maxIdleTimeMS: 10000,
// };

// /* ---------- SINGLETON CLIENT PROMISE (best fix for Vercel serverless) ---------- */
// let clientPromise;

// if (!global._mongoClientPromise) {
//   const client = new MongoClient(uri, options);
//   global._mongoClientPromise = client.connect()
//     .then(() => console.log("✅ MongoDB Connected"))
//     .catch(err => {
//       console.error("❌ MongoDB Connection Failed:", err.message);
//       throw err;
//     });
// }
// clientPromise = global._mongoClientPromise;

// /* ---------- GET DB HELPER ---------- */
// async function getDb() {
//   const client = await clientPromise;
//   return client.db("menu-db");
// }

// /* ---------- ROOT ---------- */
// app.get("/", (req, res) => {
//   res.send("🚀 Server Running Successfully!");
// });

// /* ---------- MEALS ---------- */
// app.get("/meals", async (req, res) => {
//   console.log("GET /meals called");
//   try {
//     const db = await getDb();
//     const meals = await db.collection("meals").find().toArray();
//     res.json(meals);
//   } catch (err) {
//     console.error("Meals Error:", err.message);
//     res.status(500).json({ message: "Server Error - DB issue" });
//   }
// });

// /* ---------- SINGLE MEAL ---------- */
// app.get("/meals/:id", async (req, res) => {
//   try {
//     const db = await getDb();
//     const result = await db.collection("meals").findOne({ _id: new ObjectId(req.params.id) });
//     res.json(result || { message: "Meal not found" });
//   } catch (error) {
//     console.error("Single Meal Error:", error.message);
//     res.status(500).json({ error: "Invalid ID or DB error" });
//   }
// });

// /* ---------- ADD MEAL ---------- */
// app.post("/meals", async (req, res) => {
//   try {
//     const db = await getDb();
//     const result = await db.collection("meals").insertOne(req.body);
//     res.json(result);
//   } catch (error) {
//     console.error("Insert Meal Error:", error.message);
//     res.status(500).json({ error: "Insert Failed" });
//   }
// });

// /* ---------- ORDERS ---------- */
// app.post("/orders", async (req, res) => {
//   try {
//     const db = await getDb();
//     const result = await db.collection("orders").insertOne(req.body);
//     res.status(201).json(result);
//   } catch (error) {
//     console.error("Order Error:", error.message);
//     res.status(500).json({ error: "Order Failed" });
//   }
// });

// /* ---------- STRIPE CHECKOUT ---------- */
// app.post("/create-checkout-session", async (req, res) => {
//   try {
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [{
//         price_data: {
//           currency: "usd",
//           product_data: { name: req.body.foodName },
//           unit_amount: req.body.price * 100,
//         },
//         quantity: 1,
//       }],
//       mode: "payment",
//       success_url: "https://capable-muffin-3d81c8.netlify.app/payment-success",
//       cancel_url: "https://capable-muffin-3d81c8.netlify.app/cancel",
//     });
//     res.json({ url: session.url });
//   } catch (error) {
//     console.error("Stripe Error:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// /* ---------- PAYMENTS ---------- */
// app.post("/payments", async (req, res) => {
//   try {
//     const db = await getDb();
//     const result = await db.collection("payments").insertOne(req.body);
//     res.status(201).json(result);
//   } catch (error) {
//     console.error("Payment Error:", error.message);
//     res.status(500).json({ error: "Payment Failed" });
//   }
// });

// /* ---------- START SERVER ---------- */
// app.listen(port, () => {
//   console.log(`🚀 Server Running on Port ${port}`);
// });


const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const Stripe = require("stripe");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log("DB USER:", process.env.DB_USERNAME);
console.log("DB PASS:", process.env.DB_PASSWORD ? "LOADED" : "NOT FOUND");
console.log("STRIPE:", process.env.STRIPE_SECRET_KEY ? "LOADED" : "NOT FOUND");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ---------- FIXED MONGODB URI + OPTIONS ---------- */
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster9.jsim6tq.mongodb.net/menu-db?retryWrites=true&w=majority`;

const options = {
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  maxIdleTimeMS: 10000,
};

/* ---------- SINGLETON CLIENT PROMISE ---------- */
let clientPromise;

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect()
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
      console.error("❌ MongoDB Connection Failed:", err.message);
      throw err;
    });
}
clientPromise = global._mongoClientPromise;

/* ---------- GET DB HELPER ---------- */
async function getDb() {
  const client = await clientPromise;
  return client.db("menu-db");
}

/* ---------- ROOT ---------- */
app.get("/", (req, res) => {
  res.send("🚀 Server Running Successfully!");
});

/* ---------- MEALS ---------- */
app.get("/meals", async (req, res) => {
  console.log("GET /meals called");
  try {
    const db = await getDb();
    const meals = await db.collection("meals").find().toArray();
    res.json(meals);
  } catch (err) {
    console.error("Meals Error:", err.message);
    res.status(500).json({ message: "Server Error - DB issue" });
  }
});

/* ---------- SINGLE MEAL ---------- */
app.get("/meals/:id", async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection("meals").findOne({ _id: new ObjectId(req.params.id) });
    res.json(result || { message: "Meal not found" });
  } catch (error) {
    console.error("Single Meal Error:", error.message);
    res.status(500).json({ error: "Invalid ID or DB error" });
  }
});

/* ---------- ADD MEAL ---------- */
app.post("/meals", async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection("meals").insertOne(req.body);
    res.json(result);
  } catch (error) {
    console.error("Insert Meal Error:", error.message);
    res.status(500).json({ error: "Insert Failed" });
  }
});

/* ---------- ORDERS ---------- */
app.post("/orders", async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.collection("orders").insertOne(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Order Error:", error.message);
    res.status(500).json({ error: "Order Failed" });
  }
});

/* ---------- STRIPE CHECKOUT SESSION (metadata add করা হয়েছে) ---------- */
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: req.body.foodName },
          unit_amount: req.body.price * 100,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: "https://capable-muffin-3d81c8.netlify.app/payment-success",
      cancel_url: "https://capable-muffin-3d81c8.netlify.app/cancel",
      metadata: {  // ← এটা add করা হয়েছে (orderId + food info save করার জন্য)
        orderId: req.body.orderId || req.body._id,
        foodName: req.body.foodName,
        price: req.body.price,
      },
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/* ---------- VERIFY + SAVE PAYMENT (নতুন route) ---------- */
app.post("/verify-and-save-payment", async (req, res) => {
  const { sessionId, userEmail } = req.body;

  if (!sessionId || !userEmail) {
    return res.status(400).json({ success: false, message: "Missing sessionId or email" });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    if (session.customer_details.email !== userEmail) {
      return res.status(400).json({ success: false, message: "Email mismatch" });
    }

    const db = await getDb();

    const paymentData = {
      userEmail,
      orderId: session.metadata.orderId,
      foodName: session.metadata.foodName || session.line_items.data[0]?.description,
      amount: session.amount_total / 100,
      transactionId: session.payment_intent,
      status: "succeeded",
      date: new Date(),
    };

    await db.collection("payments").insertOne(paymentData);

    res.json({ success: true, message: "Payment verified and saved" });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/* ---------- USER PAYMENT HISTORY (নতুন route) ---------- */
app.get("/payments/user/:email", async (req, res) => {
  try {
    const db = await getDb();
    const payments = await db.collection("payments")
      .find({ userEmail: req.params.email })
      .sort({ date: -1 })
      .toArray();
    res.json(payments);
  } catch (error) {
    console.error("Fetch history error:", error);
    res.status(500).json({ message: "Error fetching payment history" });
  }
});

/* ---------- START SERVER ---------- */
app.listen(port, () => {
  console.log(`🚀 Server Running on Port ${port}`);
});