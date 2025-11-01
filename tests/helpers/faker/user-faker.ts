import { fakerPT_BR as faker } from "@faker-js/faker";
import request from "supertest"
import { app } from "../../../src/app";

const generateUserData = () => ({
  name: faker.person.fullName(),
  phoneNumber: faker.string.numeric(11),
  email: faker.internet.email(),
  password: "teste123",
  storeName: faker.company.name(),
  cnpj: faker.string.numeric(14),
});

export { generateUserData}