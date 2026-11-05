const express=require('express');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const cors=require('cors')

const registrationRoutes = require("./routes/registrationRoutes");


dotenv.config()

const app=express();

app.use(cors());
app.use(express.json());

app.use("/api", registrationRoutes);


mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected Successfully!");
    })
    .catch((error) => {
        console.log("MongoDB Connection Failed:", error.message);
    });

app.get("/", (req, res) => {
    res.send("Registration Backend is Running!");
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});