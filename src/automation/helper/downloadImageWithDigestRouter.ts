import fs from 'fs';
import Axios  from 'axios';
import auth from 'http-auth';

export const downloadImage = async (url, filepath, username, password)=>{

    const digest = auth.digest({
        username,
        password
    });

    const response = await Axios({
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