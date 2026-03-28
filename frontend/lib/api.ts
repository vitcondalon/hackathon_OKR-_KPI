"use client";

import { clearToken, getToken } from "@/lib/auth";

function getDefaultApiBaseUrl() {
  return "/api";
}

export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.trim() || getDefaultApiBaseUrl()
).replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function looksLikeHtml(value: string) {
  const trimmed = value.trim().toLowerCase();
  return trimmed.startsWith("<!doctype html") || trimmed.startsWith("<html") || trimmed.includes("<body");
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "detail" in data
        ? String(data.detail)
        : typeof data === "string" && data.trim() !== ""
          ? looksLikeHtml(data)
            ? "Dashboard data is temporarily unavailable."
            : data
          : response.statusText || "Request failed";
    if (response.status === 401) {
      clearToken();
    }
    throw new ApiError(message, response.status);
  }

  if (typeof data === "string" && (contentType.includes("text/html") || looksLikeHtml(data))) {
    throw new ApiError("Dashboard data is temporarily unavailable.", response.status);
  }

  return data as T;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
    return parseResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Cannot reach API at ${API_BASE_URL}`, 0);
  }
}

export async function login(email: string, password: string) {
  const result = await apiRequest<{ access_token?: string; token_type?: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!result.access_token) {
    throw new ApiError("Login response did not include access_token", 0);
  }
  return {
    access_token: result.access_token,
    token_type: result.token_type ?? "bearer",
  };
}

export async function getResourceList<T>(resourcePath: string) {
  return apiRequest<T[]>(resourcePath);
}

export async function createResource<T>(resourcePath: string, payload: Record<string, unknown>) {
  return apiRequest<T>(resourcePath, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateResource<T>(
  resourcePath: string,
  id: number,
  payload: Record<string, unknown>
) {
  return apiRequest<T>(`${resourcePath}/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteResource(resourcePath: string, id: number) {
  return apiRequest<null>(`${resourcePath}/${id}`, {
    method: "DELETE",
  });
}
