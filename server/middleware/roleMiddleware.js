


export const roleMiddleware = (role) => {
  return (req, res, next) => {
    try {
      if (req.user.role !== role) {
        return res.status(403).json({ message: "Access denied" });
      }
      next();
    } catch (error) {
      return res.status(500).json({ message: "Role error" });
    }
  };
};