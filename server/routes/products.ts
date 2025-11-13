import { Hono } from "hono";
import { ProductsController } from "../controllers/productsController";

const productsRouter = new Hono();

// Product routes
productsRouter.get("/", ProductsController.getAllProducts);
productsRouter.get("/domain/:domainId", ProductsController.getProductsByDomain);
productsRouter.get("/:id", ProductsController.getProductById);
productsRouter.post("/", ProductsController.createProduct);
productsRouter.post("/bulk", ProductsController.createBulkProducts);
productsRouter.put("/:id", ProductsController.updateProduct);
productsRouter.delete("/:id", ProductsController.deleteProduct);
productsRouter.delete(
  "/domain/:domainId",
  ProductsController.deleteProductsByDomain
);

export { productsRouter };
