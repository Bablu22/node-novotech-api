import User from "../model/User.js";

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);

    if (!user) {
      res.status(404).json({ message: "User not found" });
    } else if (
      user.isAdmin ||
      user.type === "admin" ||
      user.type === "manager"
    ) {
      next();
    } else {
      res.status(401).json({ message: "Not authorized as an admin" });
    }
  } catch (error) {
    // Handle any database or other errors here
    res.status(500).json({ message: "Server error" });
  }
};

export default isAdmin;
