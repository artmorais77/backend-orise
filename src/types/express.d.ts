declare namespace Express {
  export interface Request {
    user?: { userId: string };
    codes?: Record<
      "product" | "cashRegister" | "cashMovement" | "sale",
      number
    >;
  }
}
