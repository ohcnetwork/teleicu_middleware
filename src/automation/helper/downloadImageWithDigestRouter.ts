import fs from 'fs';
import Axios ,{AxiosResponse} from 'axios';
import auth from 'http-auth';

export const downloadImage = async (url: string, filepath : string, username : string, password: string)=>{

    const options:auth.BasicOptions = {
            username,
            password
        }

    const digest = auth.digest(options);

    const response:AxiosResponse = await Axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers: {Authorization: digest}
    });
    return new Promise((resolve, reject) => {
        response.data.pipe(fs.createWriteStream(filepath))
            .on('error', reject)
            .once('close', () => resolve(filepath)); 
    });
}