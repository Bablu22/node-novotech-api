import User from "../model/User.js";

const isAdmin = async (req, res, next) => {
  const user = await User.findById(req.user);
  if (user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error("Not authorized as an admin");
  }
};

export default isAdmin;
