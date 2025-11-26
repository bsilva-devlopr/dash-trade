import Brapi from "brapi";

const brapiClient = new Brapi({
  apiKey: process.env.BRAPI_API_KEY || "",
});

export { brapiClient };

