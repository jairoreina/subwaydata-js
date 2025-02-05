import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Subway data API is running");
});

app.use("/api", router);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});