export class AuthController {
    static verifyToken = (req, res) => {
        const token = ""

        if (this._validateJwt(token)) {
            return res.send({ status: "1" });
        }

        res.send({ status: "0" });

    }

    static _validateJwt = (token) => {
        return true
    }

}