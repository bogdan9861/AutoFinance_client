import api from "..";

export const createReport = async (data) => {
  return await api.post("/reports", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getAllReports = async (data) => {
  return await api.get("/reports");
};

export const deleteReport = async (id) => {
  return await api.delete(`/reports/${id}`);
};
