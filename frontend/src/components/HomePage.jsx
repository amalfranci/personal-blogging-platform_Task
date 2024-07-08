import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../App.css";
import { clearUser, setUser } from "../Redux/userSlice";

const HomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo, isAuthenticated } = useSelector((state) => state.user);
  const [posts, setPosts] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState({ title: "", content: "" });
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const res = await axios.get("http://localhost:4000/user/check-auth");
        if (res.data.authenticated) {
          dispatch(setUser(res.data.userData));
        } else {
          dispatch(clearUser());
          toast.error("Authentication failed. Please log in.");
          navigate("/login");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while checking authentication.");
        navigate("/login");
      }
    };

    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:4000/user/");
        setPosts(res.data);
      } catch (error) {
        console.error(error);
        toast.error("An error occurred while fetching posts.");
      }
    };

    checkAuthentication();
    fetchPosts();
  }, [dispatch, navigate]);

  const handleOpen = () => {
    setCurrentPost({ title: "", content: "" });
    setEditing(false);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleTitleChange = (value) => {
    setCurrentPost({ ...currentPost, title: value });
  };

  const handleContentChange = (value) => {
    setCurrentPost({ ...currentPost, content: value });
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await axios.put(
          `http://localhost:4000/user/update/${currentPost._id}`,
          currentPost
        );
        toast.success("Post updated successfully!");
      } else {
        await axios.post("http://localhost:4000/user/create", currentPost);
        toast.success("Post created successfully!");
      }
      setPosts(await (await axios.get("http://localhost:4000/user/")).data);
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while saving the post.");
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setEditing(true);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/user/delete/${id}`);
      setPosts(await (await axios.get("http://localhost:4000/user/")).data);
      toast.success("Post deleted successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the post.");
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:4000/user/logout");
      dispatch(clearUser());
      navigate("/login");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while logging out.");
    }
  };

  return (
    <div>
      <div className="flex justify-between mb-5 items-center px-4 w-auto h-14 bg-purple-900 text-white font-semibold">
        <ToastContainer />
        <div>Welcome to MyBLOG</div>
        <ul className="list-none flex justify-between items-center">
          {isAuthenticated && (
            <a href="#" className="mr-5 hover:text-gray-300">
              <li className="list-none">{userInfo.name}</li>
            </a>
          )}
          {isAuthenticated ? (
            <a
              href="#"
              className="bg-indigo-500 hover:text-indigo-500 hover:bg-white py-1 px-3"
              onClick={handleLogout}
            >
              <li className="list-none">Logout</li>
            </a>
          ) : (
            <a
              href="#"
              className="bg-indigo-500 hover:text-indigo-500 hover:bg-white py-1 px-3"
              onClick={handleLogin}
            >
              <li className="list-none">Login</li>
            </a>
          )}
        </ul>
      </div>
      <div className="flex justify-end px-4">
        {isAuthenticated && (
          <Button variant="contained" color="primary" onClick={handleOpen}>
            Create New Post
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-5 mt-5 justify-center text-center p-4">
        {posts.map((post) => (
          <div
            key={post._id}
            className="p-2 border border-gray-300 rounded-lg bg-gray-50"
          >
            <div className="text-start">
              <p className="text-lg text-red-500">{post.author.name}</p>
              <p className="text-sm text-gray-500">
                Created at: {new Date(post.createdAt).toLocaleString()}
              </p>
            </div>
            <h2
              className="mb-2"
              dangerouslySetInnerHTML={{ __html: post.title }}
            ></h2>
            <div
              className="my-2"
              dangerouslySetInnerHTML={{ __html: post.content }}
            ></div>
            <div className="text-end">
              {isAuthenticated && post.author._id === userInfo._id && (
                <>
                  <IconButton onClick={() => handleEdit(post)}>
                    <Edit />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(post._id)}>
                    <Delete />
                  </IconButton>
                </>
              )}
              <p className="text-sm text-gray-500">
                Updated at: {new Date(post.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className="text-center">
          {editing ? "Edit Post" : "Create New Post"}
        </DialogTitle>
        <DialogContent className="flex flex-col gap-5 items-center">
          <ReactQuill
            theme="snow"
            value={currentPost.title}
            onChange={handleTitleChange}
            placeholder="Title"
          />
          <ReactQuill
            theme="snow"
            value={currentPost.content}
            onChange={handleContentChange}
            placeholder="Content"
          />
        </DialogContent>
        <DialogActions className="justify-between">
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            {editing ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HomePage;
