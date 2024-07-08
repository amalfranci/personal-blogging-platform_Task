import mongoose from "mongoose";
import BlogPost from "../Models/blogModel.js";

//  creating posts

const createPost = async (req, res) => {
  const { title, content } = req.body;
  const author = req.userId;

  try {
    const newPost = new BlogPost({ title, content, author });
    await newPost.save();
    res.status(201).json({ newPost, msg: "Post created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// fetching posts

const getPosts = async (req, res) => {
  try {
    const posts = await BlogPost.find().populate("author", "name email");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// updating posts
const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.userId;

  try {
    const post = await BlogPost.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to edit this post" });
    }

    post.title = title;
    post.content = content;
    await post.save();
    res.json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// dleteing post

const deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPost = await BlogPost.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(200).json({ msg: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { createPost, getPosts, updatePost, deletePost };
