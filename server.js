const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    app.listen(PORT, () =>
      console.log(`DB connected and Server running on port ${PORT}`)
    );
  } catch (error) {
    console.log(error);
  }
};

// Comment Schema
const commentSchema = new mongoose.Schema({
  username: String,
  comment: String,
  timestamp: { type: Date, default: Date.now }, // Timestamp for comments
  replies: [
    {
      username: String,
      reply: String,
      timestamp: { type: Date, default: Date.now }, // Timestamp for replies
    },
  ],
});

const Comment = mongoose.model("Comment", commentSchema);

// Routes
app.get("/comments", async (req, res) => {
  try {
    const comments = await Comment.find();
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/comments", async (req, res) => {
  const newComment = new Comment({
    username: req.body.username,
    comment: req.body.comment,
    timestamp: new Date(), // Set the timestamp when the comment is created
  });
  await newComment.save();
  res.json(newComment);
});

app.post("/comments/:id/reply", async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  comment.replies.push({
    username: req.body.username,
    reply: req.body.reply,
    timestamp: new Date(), // Set the timestamp when the reply is created
  });
  await comment.save();
  res.json(comment);
});

// Serve static files (HTML, CSS, JS)
app.use(express.static("public"));

start();
