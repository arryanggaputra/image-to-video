import { Hono } from "hono";
import { domainsRouter } from "./domains";
import { productsRouter } from "./products";
import videoController from "../controllers/videoController";
import dailymotionController from "../controllers/dailymotionController";

const apiRouter = new Hono();

// Mount routes
apiRouter.route("/domains", domainsRouter);
apiRouter.route("/products", productsRouter);
apiRouter.route("/videos", videoController);
apiRouter.route("/dailymotion", dailymotionController);

export { apiRouter };
