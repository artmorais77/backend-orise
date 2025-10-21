import { ProductsController } from "@/controllers/products-controller"
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated"
import { Router} from "express"

const productsRoutes = Router()
const productsController = new ProductsController

productsRoutes.use(ensureAuthenticated)

productsRoutes.post("/", productsController.create)
productsRoutes.get("/", productsController.index)
productsRoutes.put("/:productId", productsController.update)
productsRoutes.patch("/:productId", productsController.delete)

export {productsRoutes}
