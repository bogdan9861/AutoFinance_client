import api from "..";

export const getCars = async () => {
  return await api.get("/cars/");
};

export const createCars = async (data) => {
  return await api.post("/cars/", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const editCars = async (id, data) => {
  return await api.put(`/cars/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteCar = async (id) => {
  return await api.delete(`/cars/${id}`);
};
