import api from "..";

export const createExpencess = async (data) => {
  return await api.post("/expencess", data);
};

export const editExpencess = async (id, data) => {
  return await api.put(`/expencess/${id}`, data);
};

export const removeExpencess = async (id) => {
  return await api.delete(`/expencess/${id}`);
};

export const getExpencess = async () => {
  return await api.get("/expencess");
};
