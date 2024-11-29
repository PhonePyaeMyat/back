const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();

// Middleware 
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.static(path.join(__dirname, 'front', 'index.html')));

const mongoURI = "mongodb+srv://PhonePyaeMyat:Phone123@phonepyaemyat.l2wgl.mongodb.net/school_activities";
const dbName = "school_activities";
let db;

// Connect to MongoDB
async function connectDB() {
    try {
        const client = new MongoClient(mongoURI); 
        await client.connect();
        console.log('Successfully connected to MongoDB Atlas');
        db = client.db(dbName); // Select the database
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1); // Exit if connection fails
    }
}

connectDB(); // Initiate connection

// Endpoint to fetch lessons
app.get('/lessons', async (req, res) => {
    try {
        console.log('Received request for lessons');
        const lessons = await db.collection('lessons').find().toArray();
        res.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        res.status(500).json({ message: 'Error fetching lessons' });
    }
});

// Endpoint to add a lesson
app.post('/lessons', async (req, res) => {
    const lesson = {
        _id: new ObjectId(),
        ...req.body
    };

    try {
        await db.collection('lessons').insertOne(lesson);
        res.status(201).json(lesson);
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(400).json({ message: 'Error creating lesson' });
    }
});

// Endpoint to create an order
app.post('/orders', async (req, res) => {
    const { name, phone, cart } = req.body;

    const order = {
        orderId: uuidv4(),
        name,
        phone,
        items: cart
    };

    try {
        await db.collection('orders').insertOne(order);
        res.status(201).json({ orderId: order.orderId });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ message: 'Error creating order' });
    }
});

// Endpoint to fetch all orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await db.collection('orders').find().toArray();
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Error fetching orders' });
    }
});

// Handle 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
