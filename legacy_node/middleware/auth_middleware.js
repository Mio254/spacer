import jwt from "jsonwebtoken"

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization
  if (!header) return res.status(401).json({ error: "unauthorized" })

  const token = header.split(" ")[1]
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  req.user = decoded
  next()
}

export default authMiddleware
