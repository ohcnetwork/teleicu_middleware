import fs from 'fs'

export const makeDataDumpToJson = (v1Payload, v2Payload, assetExternalId, patient_id, consultation_id)=>{

  try{
    const dataDump = {
        "assetExternalId": assetExternalId,
        "patient_id": patient_id,
        "consultation_id": consultation_id,
        "v1Payload": v1Payload,
        "v2Payload": v2Payload
    }

    const dataDumpJson = JSON.stringify(dataDump)
    fs.writeFile(`../../../dump/${assetExternalId}.json`, dataDumpJson)
  }
  catch(err)
  {
    console.log(err)
  }
}