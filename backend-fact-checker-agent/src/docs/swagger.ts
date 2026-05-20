import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../../swagger.json";

export const swaggerServe = swaggerUi.serve;
export const swaggerSetup = swaggerUi.setup(swaggerDocument, {
  customSiteTitle: "SwarmX-AI Fact Checker API"
});
