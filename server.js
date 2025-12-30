const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const connectDb = require("./config/ConnectDB");
const cors = require("cors");
const Recipes = require("./models/recipe");
const User = require("./models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(cors({
    origin: "http://localhost:5173"
}));

// env file 
const pp = process.env.PORT
const Port = pp || 3000;
connectDb();
app.use(express.json());


// Home route 
app.get("/getRecipe", async (req, res) => {
    const recipes = await Recipes.find();
    return res.send(recipes);
});


app.get("/:id/getRecipe", async (req, res) => {
    const recipe = await Recipes.findById(req.params.id)
    return res.json(recipe);
});


// post data on browser 
app.post("/addRecipes", async (req, res) => {
    const { title, ingredients, instruction, time } = req.body;

    if (!title || !ingredients || !instruction || !time) {
        res.send("Required field cant be empty");
    }

    const newRecipe = await Recipe.create({
        title, ingredients, instruction, time
    });

    return res.json(newRecipe);
});


// Update Data 
app.put("/:id/editRecipe", async (req, res) => {
    const { title, ingredients, instruction, time } = req.body;
    let recipe = await Recipes.findById(req.params.id);

    try {
        if (recipe) {
            await Recipes.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(title, ingredients, instruction, time);
        }
    }
    catch (err) {
        return res.status(404).json({ message: "Page Not Found !" });
    }
});

// Delete Data 
app.delete("/:id/deleteRecipe", (req, res) => {
    res.send("Starting of food recipie app");
});

app.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashpwd = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashpwd
        });

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.SECRETE_KEY,
            { expiresIn: "1d" }
        );

        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                email: newUser.email
            }
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});



app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.SECRETE_KEY,
        { expiresIn: "1d" }
    );

    res.status(200).json({ token, user });
});



app.get("/user/:id", async (req, res) => {
    let user = await User.findById(req.params.id);
    res.json({ email: user.email });
});


app.listen(Port, () => {
    console.log(`Server is listening on ${Port}`);
})
