// Centralized API Configuration
// Vite uses 'import.meta.env' for environment variables.
// On Render, we will set VITE_API_URL to the backend URL.

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const API_BASE_URL = RAW_API_URL.endsWith('/') ? RAW_API_URL.slice(0, -1) : RAW_API_URL;

export const API_ENDPOINTS = {
    ACCESS_EVENT: `${API_BASE_URL}/access/event`,
    EVENTS: `${API_BASE_URL}/events`,
    STREAM: `${API_BASE_URL}/events/stream`,
    SETTINGS: `${API_BASE_URL}/settings`,
    SYSTEM_DEVICES: `${API_BASE_URL}/system/devices`,
    REVIEW_QUEUE: `${API_BASE_URL}/review/queue`,
    REVIEW_ACTION: `${API_BASE_URL}/review/action`,
    REPORTS_STATS: `${API_BASE_URL}/reports/stats`,
    REPORTS_EXPORT: `${API_BASE_URL}/reports/export`,
    ALERTS: `${API_BASE_URL}/alerts`,
    USERS: `${API_BASE_URL}/users`,
    USERS_SEARCH: `${API_BASE_URL}/users/search`,
    STATS_SUMMARY: `${API_BASE_URL}/stats/summary`,
    SIMULATE_REVIEW: `${API_BASE_URL}/simulate/review`,
};
