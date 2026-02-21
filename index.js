


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
//   serverSelectionTimeoutMS: 30000,
//   maxIdleTimeMS: 10000,
// };

// /* ---------- SINGLETON CLIENT PROMISE ---------- */
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

// /* ---------- STRIPE CHECKOUT SESSION (metadata add করা হয়েছে) ---------- */
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
//       metadata: {  // ← এটা add করা হয়েছে (orderId + food info save করার জন্য)
//         orderId: req.body.orderId || req.body._id,
//         foodName: req.body.foodName,
//         price: req.body.price,
//       },
//     });
//     res.json({ url: session.url });
//   } catch (error) {
//     console.error("Stripe Error:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// /* ---------- VERIFY + SAVE PAYMENT (নতুন route) ---------- */
// app.post("/verify-and-save-payment", async (req, res) => {
//   const { sessionId, userEmail } = req.body;

//   if (!sessionId || !userEmail) {
//     return res.status(400).json({ success: false, message: "Missing sessionId or email" });
//   }

//   try {
//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     if (session.payment_status !== "paid") {
//       return res.status(400).json({ success: false, message: "Payment not completed" });
//     }

//     if (session.customer_details.email !== userEmail) {
//       return res.status(400).json({ success: false, message: "Email mismatch" });
//     }

//     const db = await getDb();

//     const paymentData = {
//       userEmail,
//       orderId: session.metadata.orderId,
//       foodName: session.metadata.foodName || session.line_items.data[0]?.description,
//       amount: session.amount_total / 100,
//       transactionId: session.payment_intent,
//       status: "succeeded",
//       date: new Date(),
//     };

//     await db.collection("payments").insertOne(paymentData);

//     res.json({ success: true, message: "Payment verified and saved" });
//   } catch (error) {
//     console.error("Verify payment error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// });

// /* ---------- USER PAYMENT HISTORY (নতুন route) ---------- */
// app.get("/payments/user/:email", async (req, res) => {
//   try {
//     const db = await getDb();
//     const payments = await db.collection("payments")
//       .find({ userEmail: req.params.email })
//       .sort({ date: -1 })
//       .toArray();
//     res.json(payments);
//   } catch (error) {
//     console.error("Fetch history error:", error);
//     res.status(500).json({ message: "Error fetching payment history" });
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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ---------- MONGODB ---------- */

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



/* =========================================================
   USERS ROUTES
========================================================= */

/* Save user */
app.post("/users", async (req, res) => {

  try {

    const db = await getDb();

    const email = req.body.email;

    const exists = await db.collection("users").findOne({ email });

    if (exists) {
      return res.json({ message: "User already exists" });
    }

    const user = {
      email,
      role: "customer",
      createdAt: new Date()
    };

    const result = await db.collection("users").insertOne(user);

    res.json(result);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }

});


/* Get role */
app.get("/users/role/:email", async (req, res) => {

  const db = await getDb();

  const user = await db.collection("users").findOne({
    email: req.params.email
  });

  res.json({
    role: user?.role || "customer"
  });

});



/* =========================================================
   MEALS ROUTES
========================================================= */

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


/* Delete meal */
app.delete("/meals/:id", async (req, res) => {

  const db = await getDb();

  const result = await db.collection("meals").deleteOne({
    _id: new ObjectId(req.params.id)
  });

  res.json(result);

});



/* =========================================================
   ORDERS ROUTES
========================================================= */

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



/* =========================================================
   STRIPE PAYMENT
========================================================= */

app.post("/create-checkout-session", async (req, res) => {

  try {

    const { foodName, price, orderId } = req.body;

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

      success_url: `http://localhost:5173/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${orderId}`,
      cancel_url: `http://localhost:5173/dashboard/my-orders`,
    });

    res.json({ url: session.url });

  } catch (error) {

    res.status(500).json({ error: error.message });

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



/* =========================================================
   PAYMENT HISTORY
========================================================= */

app.get("/payments/user/:email", async (req, res) => {

  const db = await getDb();

  const payments = await db.collection("payments")
    .find({ userEmail: req.params.email })
    .sort({ date: -1 })
    .toArray();

  res.json(payments);

});



/* =========================================================
   START SERVER
========================================================= */

app.listen(port, () => {

  console.log(`🚀 Server running on port ${port}`);

});