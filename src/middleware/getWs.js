export const getWs = (ws) => (req, res, next) => {
    req.wsInstance = ws
    next()
}