import jwt from 'jsonwebtoken';

// for routes protects auth
const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;
    console.log("fetching token",token)
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
      const decoded = jwt.verify(token, process.env.KEY);
      console.log("iam",decoded.userId)
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

export default authMiddleware;