import api from "..";

export const getDashboard = async () => {
  return await api.get("/dashboard");
};
