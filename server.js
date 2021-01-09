const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const config = require('./config.json');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true  }));
app.use(bodyParser.json({ limit: '20mb', extended: true }));

app.use('/products', require('./controllers/products.controller'));
app.use('/warehouse', require('./controllers/warehouse.controller'));
app.use('/ingredients', require('./controllers/ingredients.controller'));
app.use('/dishes', require('./controllers/dishes.controller'))
app.use('/recipes', require('./controllers/recipes.controller'));
app.use('/menu', require('./controllers/menu.controller'));
app.use('/orderhistory', require('./controllers/orderHistory.controller'));

app.listen(config.port, (error) => {
    if (error) {
        console.log("Something went wrong =(", error)
    }
    console.log(`Server listening at ${config.port} port`);
})