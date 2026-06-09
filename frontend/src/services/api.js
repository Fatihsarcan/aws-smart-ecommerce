import axios from "axios";
import { getToken } from "./auth";

const BASE_URL = process.env.REACT_APP_API_URL;

async function authHeaders() {
  const token = await getToken();
  return { Authorization: `Bearer ${token}` };
}

export async function getProducts() {
  const headers = await authHeaders();
  const { data } = await axios.get(`${BASE_URL}/products`, { headers });
  return data.products;
}

export async function getProduct(id) {
  const headers = await authHeaders();
  const { data } = await axios.get(`${BASE_URL}/products/${id}`, { headers });
  return data;
}

export async function createOrder(product) {
  const headers = await authHeaders();
  const { data } = await axios.post(
    `${BASE_URL}/orders`,
    { productId: product.productId, productName: product.name, price: product.price },
    { headers }
  );
  return data.order;
}

export async function getOrders() {
  const headers = await authHeaders();
  const { data } = await axios.get(`${BASE_URL}/orders`, { headers });
  return data.orders;
}
