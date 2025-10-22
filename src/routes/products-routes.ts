import { ProductsController } from "@/controllers/products-controller"
import { autoIncrementCode } from "@/middlewares/autoIncrementCode"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { Router} from "express"

const productsRoutes = Router()
const productsController = new ProductsController

productsRoutes.use(ensureAuthenticated)

productsRoutes.post("/", autoIncrementCode(["product"]), productsController.create)
productsRoutes.get("/", productsController.index)
productsRoutes.put("/:productId", productsController.update)
productsRoutes.patch("/:productId", productsController.delete)

export {productsRoutes}
