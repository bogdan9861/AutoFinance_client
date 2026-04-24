import api from "..";

export const createMaintance = async (data) => {
  return await api.post("/maintance", data);
};

export const editMaintance = async (id, data) => {
  return await api.put(`/maintance/${id}`, data);
};

export const getMaintance = async () => {
  return await api.get("/maintance");
};

export const removeMaintance = async (id) => {
  return await api.delete(`/maintance/${id}`);
};
