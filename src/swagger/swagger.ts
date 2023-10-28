import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const CUR_DIR = process.cwd();

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Teleicu middleware server",
    version: "1.0.0",
    description:
      "Middleware to help tunnel CCTV Streams and ONVIF APIs for TeleICU",
    // contact: {
    //   name: "JSONPlaceholder",
    //   url: "https://jsonplaceholder.typicode.com",
    // },
  },
};

const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [
    path.join(CUR_DIR, "src/controller/*.ts"),
    path.join(CUR_DIR, "src/swagger/common.ts"),
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
