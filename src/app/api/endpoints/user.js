import api from "..";

export const login = async (data) => {
  return await api.post("/users/login", data);
};

export const register = async (data) => {
  return await api.post("/users/register", data);
};

export const currentUser = async () => {
  return await api.get("/users/");
};

export const changePassword = async (data) => {
  return await api.put("/users/change-password", data);
};

export const editUser = async (data) => {
  return await api.put(`/users/`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const removeUser = async () => {
  return await api.delete("/users/");
};
