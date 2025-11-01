import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/database/prisma";

describe("Sessions routes(/sessions)", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.store.deleteMany();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("deve fazer login", async () => {
    await request(app).post("/users").send({
      name: "teste",
      phoneNumber: "99987654321",
      email: "teste@email.com",
      password: "teste123",

      storeName: "Teste",
      cnpj: "01234567891011",
    });

    const response = await request(app).post("/session").send({
      email: "teste@email.com",
      password: "teste123",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.user.password).toBeUndefined();
  });

  it("deve falhar ao tentar fazer login com email inexistente", async () => {
    await request(app).post("/users").send({
      name: "teste",
      phoneNumber: "99987654321",
      email: "teste@email.com",
      password: "teste123",

      storeName: "Teste",
      cnpj: "01234567891011",
    });

    const response = await request(app).post("/session").send({
      email: "teste1@email.com",
      password: "teste123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email e/ou senha inválidos");
  });

  it("deve falhar ao tentar fazer login com senha incorreta", async () => {
    await request(app).post("/users").send({
      name: "teste",
      phoneNumber: "99987654321",
      email: "teste@email.com",
      password: "teste123",

      storeName: "Teste",
      cnpj: "01234567891011",
    });

    const response = await request(app).post("/session").send({
      email: "teste@email.com",
      password: "teste1234",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email e/ou senha inválidos");
  });

  it("deve falhar ao tentar fazer login dados inválidos (Zod)", async () => {
    await request(app).post("/users").send({
      name: "teste",
      phoneNumber: "99987654321",
      email: "teste@email.com",
      password: "teste123",

      storeName: "Teste",
      cnpj: "01234567891011",
    });

    const response = await request(app).post("/session").send({
      email: "testeemail.com",
      password: 12311234,
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("erro de validação");
    expect(response.body.issues).toHaveProperty("email");
    expect(response.body.issues).toHaveProperty("password");
  });

  it("deve conseguir acessar com o token", async () => {
    await request(app).post("/users").send({
      name: "teste",
      phoneNumber: "99987654321",
      email: "teste@email.com",
      password: "teste123",

      storeName: "Teste",
      cnpj: "01234567891011",
    });

    const auth = await request(app).post("/session").send({
      email: "teste@email.com",
      password: "teste123",
    });

    const token = auth.body.token;

    const response = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${token}`);

    expect(auth.status).toBe(200);
    expect(auth.body).toHaveProperty("token");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("data");
  });

  it("deve falhar o tentar acessar rotas que requer autenticação", async () => {
    const response = await request(app).get("/products");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Token invalido");
  });

  it("deve falhar o tentar acessar rotas que requer autenticação com token invalido", async () => {
    const tokenInvalido =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";

    const response = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${tokenInvalido}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Token invalido");
  });
});
