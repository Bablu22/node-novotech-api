import jwt from "jsonwebtoken";

export const getTokenFromHeader = (req) => {
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith("Bearer")) {
    return authorization.split(" ")[1];
  } else {
    throw new Error("Not authorized, no token found");
  }
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return false;
    } else {
      return decoded;
    }
  });
};
