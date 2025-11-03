import express from "express";
import flashcards from "./models/flashcards.js";
import card_categories from "./models/flashcards.js";

const port = 3333;
const app = express();

app.set("view engine", "ejs");

app.use(express.static("public"));

app.get("/cards/categories/", (req, res) => {
  res.render("categories", {
    title: "Kategorie",
    categories: Object.entries(card_categories).map(
      ([id, category]) => category.name
    ),
  });
});

app.get("/cards/:category_id", (req, res) => {
  if (card_categories.hasOwnProperty(req.params.category_id)) {
    const category = card_categories[req.params.category_id];
    res.render("category", {
      title: category.name,
      category,
    });
  } else {
    res.sendStatus(404);
  }
});

app.post("/cards/:category_id/new", (req, res) => {
  const category_id = req.params.category_id;
  if (!flashcards.hasCategory(category_id)) {
    res.sendStatus(404);
  } else {
    let card_data = {
      front: req.body.front,
      back: req.body.back,
    };
    var errors = flashcards.validateCardData(card_data);
    if (errors.length == 0) {
      flashcards.addCard(category_id, card_data);
      res.redirect(`/cards/${category_id}`);
    } else {
      res.status(400);
      res.render("new_card", {
        errors,
        title: "Nowa fiszka",
        front: req.body.front,
        back: req.body.back,
        category: {
          id: category_id,
        },
      });
    }
  }
});

app.listen(port, () => {
    console.log(`Server listiening on http://localhost:${port}`)
})

