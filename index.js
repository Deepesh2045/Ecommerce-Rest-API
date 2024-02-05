import express from "express";
import connectDb from "./connect.db.js";
import userRoutes from "./user/user.route.js";
import productRoutes from "./product/product.route.js";
import cartRoutes from "./cart/cart.routes.js";

const app = express();
// to make app understand json
app.use(express.json());

//connect database
connectDb();

// register routes
app.use(userRoutes);
app.use(productRoutes);
app.use(cartRoutes);

// server and network port
const port = 8000;

app.listen(port, () => {
  console.log(`App is listing on port ${port}`);
});
