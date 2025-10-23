declare namespace Express {
  export interface Request {
    user?: { userId: string, storeId: string };

    codes?: Record<
      "product" | "cashRegister" | "cashMovement" | "sale",
      number
    >;
  }
}
