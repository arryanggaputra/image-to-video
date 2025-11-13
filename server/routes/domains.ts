import { Hono } from "hono";
import { DomainsController } from "../controllers/domainsController";

const domainsRouter = new Hono();

// Domain routes
domainsRouter.get("/", DomainsController.getAllDomains);
domainsRouter.get("/:id", DomainsController.getDomainById);
domainsRouter.get(
  "/:id/with-products",
  DomainsController.getDomainWithProducts
);
domainsRouter.post("/", DomainsController.createDomain);
domainsRouter.put("/:id", DomainsController.updateDomain);
domainsRouter.delete("/:id", DomainsController.deleteDomain);

export { domainsRouter };
