const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// cors state for cross origin request service. its create relationship between backend and fontend 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@shimulclaster1.85diumq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db("productsDB");
        const products = database.collection("products");
        const cartItem = database.collection("cartItem");

        app.get('/products', async (req, res) => {
            const allProducts = await products.find().toArray();
            res.send(allProducts)
        })

        app.get('/carts', async (req, res) => {
            const allCartItem = await cartItem.find().toArray();
            res.send(allCartItem)
        })

        app.get('/brand/:id', async (req, res) => {
            const id = req.params.id;
            const query = { brand_name : id.toLocaleLowerCase() };
            const searchProducts = await products.find(query).toArray();
            res.send(searchProducts)
        })

        app.get('/details/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: new ObjectId(id) }
            const product = await products.findOne(query);
            res.send(product);
        })

        app.get('/update/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const product = await products.findOne(query);
            res.send(product);
        })

        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const body = req.body
            // console.log(body)
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateProduct = {
                $set: {
                    name: body.name,
                    image: body.image,
                    brand_name: body.brand_name,
                    price: body.price,
                    rating: body.rating,
                    category: body.category,
                    description: body.description
                },
            };
            const result = await products.updateOne(filter, updateProduct, options);
            res.send(result)
        })

        app.post('/products', async (req, res) => {
            const product = req.body
            // console.log(product)
            const result = await products.insertOne(product);
            res.send(result);
        })
        app.post('/carts', async (req, res) => {
            const product = req.body
            console.log(product)
            const result = await cartItem.insertOne(product);
            res.send(result);
        })

        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartItem.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.listen(5000, () => {
    console.log('Server running at port 5000');
})