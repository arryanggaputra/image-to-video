import { Hono } from "hono";
import { domainsRouter } from "./domains";

const apiRouter = new Hono();

// Mount domain routes
apiRouter.route("/domains", domainsRouter);

export { apiRouter };
