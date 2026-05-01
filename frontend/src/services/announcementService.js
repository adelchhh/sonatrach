import { apiGet, apiPostForm, apiDelete } from "../api";
import { apiPatch } from "../api";


export function getPublicAnnouncements() {
  return apiGet("/api/announcements");
}

export function getPublicAnnouncement(id) {
  return apiGet(`/api/announcements/${id}`);
}

export function getCommunicatorAnnouncements() {
  return apiGet("/api/communicator/announcements");
}

export function createAnnouncement(data) {
  return apiPostForm("/api/communicator/announcements", data);
}

export function deleteAnnouncement(id) {
  return apiDelete(`/api/communicator/announcements/${id}`);
}


export function publishAnnouncement(id) {
  return apiPatch(`/api/communicator/announcements/${id}/publish`);
}