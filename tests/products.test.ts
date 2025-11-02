import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/database/prisma";
import { createUserAndLogin } from "./helpers/auth-helper";
import { cleanupDatabase } from "./helpers/cleanupDatabase";
import { generateProductData } from "./helpers/faker/product-fake";

describe("Products routes (/products)", () => {
  beforeEach(cleanupDatabase);
  afterEach(cleanupDatabase);
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("deve criar um produto com sucesso", async () => {
    const product = generateProductData();
    const { token, user } = await createUserAndLogin();

    const response = await request(app)
      .post("/products")
      .send(product)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Produto criado com sucesso");
    expect(response.body.product).toHaveProperty("id");
    expect(response.body.product).toHaveProperty("code");

    const existingUser = await prisma.user.findFirst({
      where: { email: user.email },
    });

    expect(response.body.product.userId).toBe(existingUser?.id);

    const store = await prisma.store.findFirst({
      where: {
        cnpj: user.cnpj,
      },
    });

    expect(response.body.product.storeId).toBe(store?.id);
  });

  it("deve falhar ao tentar criar um produto com o mesmo nome na mesma loja", async () => {
    const product = generateProductData();
    const { token } = await createUserAndLogin();

    await request(app)
      .post("/products")
      .send(product)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .post("/products")
      .send(product)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Ja existe um produto com esse nome");
  });

  it("deve criar um produto com o mesmo nome em loja diferentes", async () => {
    const { token: token1 } = await createUserAndLogin();
    const { token: token2 } = await createUserAndLogin();
    const product = generateProductData();

    const response = await request(app)
      .post("/products")
      .send(product)
      .set("Authorization", `Bearer ${token1}`);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Produto criado com sucesso");
    expect(response.body.product).toHaveProperty("id");

    const response2 = await request(app)
      .post("/products")
      .send(product)
      .set("Authorization", `Bearer ${token2}`);

    expect(response2.status).toBe(201);
    expect(response2.body.message).toBe("Produto criado com sucesso");
    expect(response2.body.product).toHaveProperty("id");
  });

  it("deve listar produtos", async () => {
    const { token, userResponse } = await createUserAndLogin();
    const product1 = generateProductData();
    const product2 = generateProductData();

    await request(app)
      .post("/products")
      .send(product1)
      .set("Authorization", `Bearer ${token}`);
    await request(app)
      .post("/products")
      .send(product2)
      .set("Authorization", `Bearer ${token}`);

    const response = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);

    const storeId = userResponse.body.store.id;

    response.body.data.forEach((product: any) => {
      expect(product.storeId).toBe(storeId);
    });

    const filterByName = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${token}`)
      .query({ name: product1.name });

    expect(filterByName.status).toBe(200);
    filterByName.body.data.forEach((product: any) => {
      expect(product.name).toBe(product1.name);
    });

    const filterByCategory = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${token}`)
      .query({ category: product1.category });

    expect(filterByCategory.status).toBe(200);
    filterByCategory.body.data.forEach((product: any) => {
      expect(product.category).toBe(product1.category);
    });

    const filterByCode = await request(app)
      .get("/products")
      .set("Authorization", `Bearer ${token}`)
      .query({ code: 1 });

    expect(filterByCode.status).toBe(200);
    filterByCode.body.data.forEach((product: any) => {
      expect(product.code).toBe(1);
    });
  });

  it("deve atualizar produto", async () => {
    const { token } = await createUserAndLogin();
    const product1 = generateProductData();
    const product2 = generateProductData();

    const createProduct = await request(app)
      .post("/products")
      .send(product1)
      .set("Authorization", `Bearer ${token}`);

    const updateProduct = await request(app)
      .put(`/products/${createProduct.body.product.id}`)
      .send(product2)
      .set("Authorization", `Bearer ${token}`);

    expect(updateProduct.status).toBe(200);
    expect(updateProduct.body.message).toBe("Produto atualizado com sucesso");
    expect(updateProduct.body.produto).toHaveProperty("id");
  });

  it("deve falhar ao tentar atualizar um produto inexistente", async () => {
    const { token } = await createUserAndLogin();
    const product = generateProductData();

    const nonexistentProduct = "209e393f-f3f9-4ccc-8279-18a255d43bae";

    const updateProduct = await request(app)
      .put(`/products/${nonexistentProduct}`)
      .send(product)
      .set("Authorization", `Bearer ${token}`);

    expect(updateProduct.status).toBe(400);
    expect(updateProduct.body.message).toBe("Produto inexistente.");
  });

  it("deve falhar ao tentar atualizar um produto para um nome existente", async () => {
    const { token } = await createUserAndLogin();
    const product1 = generateProductData();

    const createProduct = await request(app)
      .post("/products")
      .send(product1)
      .set("Authorization", `Bearer ${token}`);

    const updateProduct = await request(app)
      .put(`/products/${createProduct.body.product.id}`)
      .send(product1)
      .set("Authorization", `Bearer ${token}`);

    expect(updateProduct.status).toBe(400);
    expect(updateProduct.body.message).toBe(
      "Ja existe um produto com esse nome"
    );
  });

  it("deve desativar/ativar um produto", async () => {
    const { token } = await createUserAndLogin();
    const product = generateProductData();

    const createProduct = await request(app)
      .post("/products")
      .send(product)
      .set("Authorization", `Bearer ${token}`);

    const cancelProduct = await request(app)
      .patch(`/products/${createProduct.body.product.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(cancelProduct.status).toBe(200);
    expect(cancelProduct.body.product.isActive).toBe(false);

    const reactivatedProduct = await request(app)
      .patch(`/products/${createProduct.body.product.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(reactivatedProduct.status).toBe(200);
    expect(reactivatedProduct.body.product.isActive).toBe(true);
  });

  it("deve falhar ao tentar desativar/ativar um produto inexistente", async () => {
    const { token } = await createUserAndLogin();

    const nonexistentProduct = "209e393f-f3f9-4ccc-8279-18a255d43bae";

    const cancelProduct = await request(app)
      .patch(`/products/${nonexistentProduct}`)
      .set("Authorization", `Bearer ${token}`);

    expect(cancelProduct.status).toBe(400);
    expect(cancelProduct.body.message).toBe("Produto inexistente.");

    const reactivatedProduct = await request(app)
      .patch(`/products/${nonexistentProduct}`)
      .set("Authorization", `Bearer ${token}`);

    expect(reactivatedProduct.status).toBe(400);
    expect(reactivatedProduct.body.message).toBe("Produto inexistente.");
  });
});
