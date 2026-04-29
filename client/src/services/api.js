import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getData = () => API.get("/data");
export const createData = (data) => API.post("/data", data);
export const getFocusSessions = () => API.get("/focus");
export const getResearch = () => API.get("/research");