import path from "path";
import swaggerJSDoc from "swagger-jsdoc";

const CUR_DIR = process.cwd();

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Express API for JSONPlaceholder",
    version: "1.0.0",
    description:
      "This is a REST API application made with Express. It retrieves data from JSONPlaceholder.",
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
    path.join(CUR_DIR, "src/controller/*.js"),
    path.join(CUR_DIR, "src/swagger/common.js"),
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
