import { apiGet, apiPatch } from "../api";

export function getIdeas() {
  return apiGet("/api/ideas");
}

export function moderateIdea(id, data) {
  return apiPatch(`/api/ideas/${id}/moderate`, data);
}