const express = require("express");
const logger = require("morgan");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const app = express();

// const { window } = new JSDOM();
const { document } = new JSDOM("").window;
global.document = document;
// let $ = (jQuery = require("jquery")(window));

require("dotenv").config();

const sequelize = require("./models/index");
const view_route = require("./routes/viewRoutes");
const user_route = require("./routes/userRoutes");
const role_route = require("./routes/roleRoutes");
const order_route = require("./routes/orderRoutes");
const order_product_route = require("./routes/orderproductRoutes");
const chat_route = require("./routes/gptRoute");
const product_route = require("./routes/productRoutes");
// const payment_info_route = require("./routes/paymentInfoRoutes")
// const patient_info = require("./routes/patientInfoRoutes");
// const shipping_route = require("./routes/shippingRoutes");
// const brand_route = require("./routes/brandRoutes");
// const category_route = require("./routes/categoryRoutes");
const { addInitialProduct } = require("./helper/initial_product");
const { googlePassport } = require("./auth/google");
const Relation = require("./models/relation.model");

process.env.NODE_CONFIG_DIR = path.join(__dirname, "/config");

// Trust Railway / proxy headers so req.secure works correctly behind Railway/Fastly
app.set("trust proxy", 1);

// Remove Express signature header
app.disable("x-powered-by");

const corsOptions = {
  origin: [
    "http://localhost:8081",
    "https://rxmdsite-production.up.railway.app",
    "http://localhost:7000",
  ],
};

app.use(cors(corsOptions));
app.use(logger("dev"));

/**
 * Force HTTPS in production when traffic reaches the app over HTTP.
 * Skip localhost/dev environments.
 */
app.use((req, res, next) => {
  const host = req.headers.host || "";
  const isLocalhost =
    host.includes("localhost") || host.startsWith("127.0.0.1");

  if (
    process.env.NODE_ENV === "production" &&
    !isLocalhost &&
    !req.secure
  ) {
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }

  next();
});

/**
 * Add HSTS header for HTTPS responses.
 * Safer version: no includeSubDomains for now.
 */
app.use((req, res, next) => {
  if (req.secure) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000");
  }
  next();
});

app.use(passport.initialize());
googlePassport(passport);

// Use static files
app.use(express.static(path.join(__dirname, "../public")));
app.use("/node", express.static(path.join(__dirname, "../node_modules")));

// Middleware
// app.use(express.json());
app.use((req, res, next) => {
  console.log(req.originalUrl);

  if (req.originalUrl === "/paymentwebhook") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// set the view engine to ejs
app.set("view engine", "ejs");

// Routes
// require("./routes/viewRoutes")(app);
app.use(user_route);
app.use(role_route);
app.use(product_route);
app.use(chat_route);
app.use(order_product_route);
app.use(order_route);
// app.use(payment_info_route);
// app.use(patient_info);
app.use(view_route);

// UNUSED SHOP ROUTES FOR LATER
// app.use(payment_route);
// app.use(shipping_route);
// app.use(category_route);
// app.use(brand_route);
// app.use(product_size_route);

Relation();

// Handle unauthorized requests
const port = process.env.PORT || 7000;

app.use((err, req, res, next) => {
  if (err.name === "UnauthorizedError") {
    return res.sendFile(path.join(__dirname, "/views/404.html"));
  }

  return next(err);
});

sequelize
  .sync()
  .then(async () => {
    app.listen(port, () => {
      const Role = require("./models/roleModel");

      const populateDB = async () => {
        const isAdmin = await Role.findOne({ where: { role: "admin" } });
        if (!isAdmin) {
          await Role.create({
            role: "admin",
          });
        }

        const isUser = await Role.findOne({ where: { role: "user" } });
        if (!isUser) {
          await Role.create({
            role: "user",
          });
        }

        return;
      };

      populateDB();
      addInitialProduct();
      console.log(`Listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
