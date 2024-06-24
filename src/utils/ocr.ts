import {
  openaiApiKey,
  openaiApiVersion,
  openaiEndpoint,
  openaiUseAzure,
  openaiVisionModel,
} from "./configs";
import { AzureOpenAI, OpenAI } from "openai";
import sharp from "sharp";

const openai = openaiUseAzure
  ? new AzureOpenAI({
      apiKey: openaiApiKey,
      endpoint: openaiEndpoint,
      apiVersion: openaiApiVersion,
    })
  : new OpenAI({
      apiKey: openaiApiKey,
    });

export async function compressImage(image: Buffer) {
  return await sharp(image).resize(1000).jpeg({ quality: 80 }).toBuffer();
}

export function encodeImage(image: Buffer) {
  return Buffer.from(image).toString("base64");
}

export async function parseVitalsFromImage(image: Buffer) {
  const compressedImage = await compressImage(image);
  const b64Image = encodeImage(compressedImage);
  const imageUrl = `data:image/jpeg;base64,${b64Image}`;

  try {
    const completions = await openai.chat.completions.create({
      model: openaiVisionModel,
      max_tokens: 4096,
      temperature: 0.4,
      // response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
        You are an expert 5Para Monitor reader of patients. You are given 5Para Monitor image, analyze it and predict patient's reading, you will output the readings in minified JSON format only.
            
        Tips to analyze the ocr data: monitor can be zoomed in or zoomed out, most of the times readings that we want are at extreme right of the monitor screen, use expertise in reading 5ParaMonitor to make educated guesses about the correct reading of a field.
            
        NOTE: Many fields from below example can be missing, you need to output null for those fields.
            
        Example output in minified JSON format:   
        {"time_stamp":"yyyy-mm-ddThh:mm:ssZ","ecg":{"Heart_Rate_bpm":<value/null>},"nibp":{"systolic_mmhg":<value/null>,"diastolic_mmhg":<value/null>,"mean_arterial_pressure_mmhg":<value/null>},"spO2":{"oxygen_saturation_percentage":<value/null>},"respiration_rate":{"breaths_per_minute":<value/null>},"temperature":{"fahrenheit":<value/null>}}

        The output should be minified JSON format only.
        `.trim(),
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    const response = completions.choices.shift()?.message.content;

    if (!response) {
      console.error("Failed to get response from OpenAI");
      return null;
    }

    console.log(`[OCR] : ${response}`);
    return JSON.parse(response);
  } catch (error) {
    console.error("Failed to get response from OpenAI", error);
    return null;
  }
}
