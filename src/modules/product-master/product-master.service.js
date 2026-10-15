import { findAllProductMasters, findProductMaster, saveProductMaster } from "./product-master.repository.js";

export const listProductMasters = findAllProductMasters;
export const getProductMaster = findProductMaster;
export const upsertProductMaster = saveProductMaster;
