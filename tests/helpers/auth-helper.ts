import request from "supertest"
import { app } from "../../src/app";
import { generateUserData } from "./faker/user-faker";

const createUserAndLogin = async () => {
  const user = generateUserData()
  await request(app).post("/users").send(user)
  const auth = await request(app).post("/session").send({
    email: user.email,
    password: user.password,
  })

  return { token: auth.body.token, user}
}

export { createUserAndLogin };
