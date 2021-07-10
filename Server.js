require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db/index");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/restaurants", async (req, res) => {
  try {
    // const results = await db.query("select * from restaurants");
    const restaurantRatingData = await db.query(
      "select * from restaurants left join (select resturant_id , COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by resturant_id) reviews on restaurants.id =reviews.resturant_id ; "
    );

    // console.log("results", results);
    console.log("restaurant data", restaurantRatingData);
    res.json({ data: { restaurants: restaurantRatingData.rows } });
  } catch (err) {
    console.log(err);
  }
});

app.get("/restaurants/:id", async (req, res) => {
  try {
    const restaurant = await db.query(
      "select * from restaurants left join (select resturant_id , COUNT(*), TRUNC(AVG(rating),1) as average_rating from reviews group by resturant_id) reviews on restaurants.id =reviews.resturant_id where id = $1 ",
      [req.params.id]
    );

    const reviews = await db.query(
      "select * from reviews where resturant_id  =$1",
      [req.params.id]
    );

    res.json({
      data: { restaurants: restaurant.rows[0], reviews: reviews.rows },
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/restaurants", async (req, res) => {
  try {
    const results = await db.query(
      "INSERT INTO restaurants (name, location,price_range) values ($1,$2,$3) returning *",
      [req.body.name, req.body.location, req.body.price_range]
    );
    res.status(201).json({ data: { restaurant: results.rows[0] } });
  } catch (error) {
    console.log(error);
  }
});

app.put("/restaurants/:id", async (req, res) => {
  try {
    const results = await db.query(
      "UPDATE restaurants SET name = $1, location = $2, price_range = $3  where id=$4 returning *",
      [req.body.name, req.body.location, req.body.price_range, req.params.id]
    );
    res.json({ data: { restaurants: results.rows[0] } });
  } catch (error) {
    console.log(error);
  }
});

app.delete("/restaurants/:id", async (req, res) => {
  try {
    const results = await db.query("DELETE FROM restaurants where id = $1", [
      req.params.id,
    ]);
    res.json({ status: "resturant deleted" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/restaurants/:id/addReview", async (req, res) => {
  try {
    const newReviews = await db.query(
      "INSERT INTO reviews (resturant_id,name, review,rating) values ($1, $2, $3, $4) returning *",
      [req.params.id, req.body.name, req.body.review, req.body.rating]
    );
    res.status(201).json({ review: newReviews.rows[0] });
  } catch (error) {
    console.log(error);
  }
});

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`server is up and listening on ${PORT}`);
});
