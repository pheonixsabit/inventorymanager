import { deleteProduct, findAllProducts, findProductBySku, saveProduct } from "./products.repository.js";

export function listProducts() {
	return findAllProducts();
}

export function getProduct(sku) {
	return findProductBySku(sku);
}

export function upsertProduct(product) {
	return saveProduct(product);
}

export function removeProduct(sku) {
	return deleteProduct(sku);
}

