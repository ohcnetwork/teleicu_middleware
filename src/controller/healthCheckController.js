import  {generateJWT} from "../utils/generateJWT.js"
import  axios from 'axios'

export const CareCommunicationCheckController = async (req, res, next) => {                             
    const value = await axios

    .get("http://localhost:8000/middleware/verify", {headers: {Authorization: "Bearer "+ await generateJWT({asset_id : "123"}) , "X-Facility-Id": "c153456a-3cb6-44ff-bff0-45475b059928 "}})
    .then(res => {
      return res.data
    })
    .catch(error => {
        return {"error" : "Authorization Failed"}
    })
    return res.send(value)
  };
   