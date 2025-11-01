import { fakerPT_BR as faker } from "@faker-js/faker";
import request from "supertest"
import { app } from "../../../src/app";

const generateProductData = () => ({
  name: faker.commerce.productName(),
  category: faker.commerce.department(),
  price: Number(faker.commerce.price({ min: 1, max: 1000 })),
});

export {generateProductData}