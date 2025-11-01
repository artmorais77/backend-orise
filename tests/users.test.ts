import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/database/prisma";
import { cleanupDatabase } from "./helpers/cleanupDatabase";
import { generateUserData } from "./helpers/faker/user-faker";

describe("User routes(/users)", () => {
  beforeEach(cleanupDatabase);
  afterEach(cleanupDatabase);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("deve criar um novo usuário e uma nova loja", async () => {
    const user = generateUserData();
    const response = await request(app).post("/users").send(user);

    expect(response.status).toBe(201);
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.store).toHaveProperty("id");
    expect(response.body.user.password).toBeUndefined();

    const existingUser = await prisma.user.findFirst({
      where: { email: response.body.user.email },
    });

    const existingStore = await prisma.store.findUnique({
      where: { id: response.body.store.id },
    });

    expect(existingUser?.storeId).toBe(existingStore?.id);
  });

  it("deve falhar ao criar usuário com email existente", async () => {
    const user = generateUserData();
    await request(app).post("/users").send(user);

    const response = await request(app).post("/users").send({
      name: "teste",
      phoneNumber: "99987654321",
      email: user.email,
      password: "teste123",

      storeName: "teste1",
      cnpj: "01234567891012",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Este email já está cadastrado");
  });

  it("deve falhar ao criar loja com CNPJ existente", async () => {
    const user = generateUserData();
    await request(app).post("/users").send(user);

    const response = await request(app).post("/users").send({
      name: "teste1",
      phoneNumber: "99987654321",
      email: "test1@email.com",
      password: "teste123",

      storeName: "teste1",
      cnpj: user.cnpj,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Este CNPJ já está cadastrado");
  });

  it("deve falhar ao criar usuário com dados inválidos (Zod)", async () => {
    const response = await request(app).post("/users").send({
      name: 123,
      phoneNumber: 99987654321,
      email: "testemail.com",
      password: "testeUmDois",

      storeName: "teste",
      cnpj: "12345678910111",
    });

    expect(response.body.issues).toHaveProperty("name");
    expect(response.body.issues).toHaveProperty("phoneNumber");
    expect(response.body.issues).toHaveProperty("email");
    expect(response.body.issues).toHaveProperty("password");
  });

  it("deve falhar ao criar loja com dados inválidos (Zod)", async () => {
    const response = await request(app).post("/users").send({
      name: "test",
      phoneNumber: "99987654321",
      email: "teste@mail.com",
      password: "teste123",

      storeName: "teste",
      cnpj: "12.345.678/9101-11",
    });

    expect(response.body.issues).toHaveProperty("cnpj");
  });
});
