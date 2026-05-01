import { apiGet, apiPost } from "../api";

export function getSentNotifications() {
  return apiGet("/api/notifications/sent");
}

export function createNotification(data) {
  return apiPost("/api/notifications", data);
}