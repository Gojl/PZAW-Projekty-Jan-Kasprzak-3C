import express from "express";

const port = 3333;
const app = express();
app.use(express.urlencoded({ extended: true }));


const wiadomosci = ["Witaj Uzytkowniku!"];

app.set("view engine", "ejs");

app.use(express.static("public"));


app.get("/dodaj/", (req, res) => {
  res.render("dodaj", {
    title: "Dodaj wiadomosc",
    wiadomosc: wiadomosci,
  });
});

app.get("/wiadomosci/", (req, res) => {
  res.render("wiadomosci", {
    title: "Wielka Sciana Wiadomosci",
    wiadomosc: wiadomosci,
  });
});

app.get("/statystyki", (req, res) => {
  const statystyki = {
    liczbaWiadomosci: wiadomosci.length,
    liczbaSlow: wiadomosci.reduce((acc, msg) => acc + msg.split(/\s+/).filter(w => w).length, 0),
    liczbaZnakow: wiadomosci.reduce((acc, msg) => acc + msg.length, 0)
  }; // chat gpt gotowal fukcje na liczenie slow i liter wiec nie daj gwarancji poprawnego liczenia xD

  res.render("statystyki.ejs", { title: "statystyki", statystyki });

});


app.post('/wiadomosci/dodaj', (req, res) => {
  wiadomosci.push(req.body.wiadomosc);
  res.redirect('/wiadomosci/');
});

app.listen(port, () => {
    console.log(`Server listiening on http://localhost:${port}`)
})

