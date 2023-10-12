import { getTokenFromHeader } from "../utils/verifyToken.js";
import { verifyToken } from "../utils/verifyToken.js";

export const isAuthenticated = (req, res, next) => {
  const token = getTokenFromHeader(req);
  const decoded = verifyToken(token);

  if (!decoded) {
    throw new Error("Invalid/Expired token, please login again");
  } else {
    req.user = decoded.id;
    next();
  }
};
