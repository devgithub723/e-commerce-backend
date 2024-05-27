require('dotenv').config();
const express = require("express")
const server = express()
const mongoose = require("mongoose")
const jwt = require('jsonwebtoken');
const cors = require("cors")
const productsRouter = require("./routes/Products")

const categoriesRouter = require("./routes/Categories")
const brandsRouter = require("./routes/Brands")
const usersRouter = require("./routes/Users")
const authRouter = require("./routes/Auth")
const cartRouter = require("./routes/Cart")
const orderRouter = require("./routes/Order")
const session = require('express-session')
const passport = require('passport')
const { User } = require("./model/User")
const SQLiteStore = require('connect-sqlite3')(session)
const LocalStrategy = require('passport-local').Strategy
const crypto = require("crypto")
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const { isAuth, sanitizeUser, cookieExtractor } = require("./services/common");
const cookieParser = require("cookie-parser");
const token = jwt.sign({ foo: 'bar' }, process.env.JWT_SECRET_KEY);
const path = require('path');
const { Order } = require('./model/Order');
// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.ENDPOINT_SECRET;


server.post('/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      const order = await Order.findById(paymentIntentSucceeded.metadata.orderId);
      order.paymentStatus = "received";
      await order.save()
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

//Passport jwt
const opts = {}
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY

// middleware
server.use(express.static(path.resolve(__dirname, 'build')))
server.use(cookieParser())
server.use(session({
  secret: 'your-secret-key',
  resave: false, // don't save session if unmodified
  saveUninitialized: false, // don't create session until something stored
}))
server.use(passport.authenticate('session'))
server.use(cors({
  exposedHeaders: ['X-Total-Count']
}))
server.use(express.json())  // to parse req.body
server.use('/products', isAuth(), productsRouter.router)   //isAuth is a middleware which check is req.user exist or not
server.use('/categories', isAuth(), categoriesRouter.router)
server.use('/brands', isAuth(), brandsRouter.router)
server.use("/users", isAuth(), usersRouter.router)
server.use("/auth", authRouter.router)
server.use("/cart", isAuth(), cartRouter.router)
server.use("/orders", isAuth(), orderRouter.router)
server.get('*', (req, res) => res.sendFile(path.resolve('build', 'index.html')));

// passport Strategies
passport.use('local', new LocalStrategy({ usernameField: 'email' }, async function (email, password, done) {
  try {
    const user = await User.findOne({ email: email }).exec()
    if (!user) {
      done(null, false, { message: "no such user with this email" })
    }
    crypto.pbkdf2(
      password,
      user.salt,
      310000,
      32,
      'sha256',
      async function (err, hashedPassword) {
        if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
          return done(null, false, { message: "Invalid Credentials" })
        }
        const token = jwt.sign(sanitizeUser(user), process.env.JWT_SECRET_KEY);
        done(null, { id: user.id, role: user.role, token })   //this line call the serialization function
      })

  } catch (err) {
    done(err)
  }
}
))
// jwt
passport.use('jwt', new JwtStrategy(opts, async function (jwt_payload, done) {
  try {
    const user = await User.findById(jwt_payload.id)
    if (user) {
      return done(null, sanitizeUser(user));
    } else {
      return done(null, false);
    }
  } catch (err) {
    return done(err, false)
  }
}));
// this creates session variable req.user on being called from callbacks
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      role: user.role,
    });
  });
});

// this creates session variable req.user when called from authorized request
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

//payment intent

// This is your test secret API key.
const stripe = require("stripe")(process.env.STRIPE_SERVER_KEY);

server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount, orderId } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount * 100,
    currency: "inr",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      orderId
    }
  });
  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

//connection for database
main().catch(err => console.error(err))
async function main() {   //mongodb://localhost:27017/ecommerce
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to the database");
}
//starting 
server.get("/", (req, res) => {
  res.json({ status: "success" })
})

// PORT 
server.listen(process.env.PORT, () => {
  console.log("server stated on port 8080")
  console.log("env:- " + { process })
})
