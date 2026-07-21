"use client";

import { useEffect, useState } from "react";

// The content keys used across the public site.
// Add new ones here as you wire up more components.
const CONTENT_KEYS = [
  { key: "dashboard_image", label: "Advanced Control — Dashboard Image", type: "IMAGE" },
  { key: "device_kiosk_image", label: "Multi Device — Kiosk Image", type: "IMAGE" },
  { key: "device_dashboard_image", label: "Multi Device — Dashboard Image", type: "IMAGE" },
  { key: "device_mobile_image", label: "Multi Device — Mobile Image", type: "IMAGE" },
  { key: "device_guichet_image", label: "Multi Device — Guichet Image", type: "IMAGE" },
  { key: "showcase_kiosk_image", label: "Showcase — Kiosk Image", type: "IMAGE" },
  { key: "showcase_agent_image", label: "Showcase — Agent Image", type: "IMAGE" },
  { key: "showcase_dashboard_image", label: "Showcase — Dashboard Image", type: "IMAGE" },
  { key: "showcase_tv_image", label: "Showcase — TV Image", type: "IMAGE" },
];

interface ContentItem {
  type: string;
  text: string | null;
  imageUrl: string | null;
}

export default function DashBoard() {
  const [content, setContent] = useState<Record<string, ContentItem>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    setLoading(true);
    const res = await fetch("/api/content");
    const data = await res.json();
    setContent(data);
    setLoading(false);
  }

  async function handleUpload(key: string, file: File) {
    setSavingKey(key);
    setMessage("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`/api/content/${key}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setMessage(`✅ Updated "${key}"`);
      await loadContent();
    } catch (err) {
      setMessage(`❌ Failed to update "${key}"`);
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) {
    return <div style={{ padding: 40 }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>Content Dashboard</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Upload images to replace the defaults shown on the public site.
      </p>

      {message && (
        <div style={{ padding: 12, marginBottom: 20, background: "#f0f0f0", borderRadius: 6 }}>
          {message}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {CONTENT_KEYS.map(({ key, label }) => {
          const current = content[key];
          const isSaving = savingKey === key;

          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 16,
                border: "1px solid #e0e0e0",
                borderRadius: 8,
              }}
            >
              <div style={{ width: 100, height: 70, flexShrink: 0, background: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 4, overflow: "hidden" }}>
                {current?.imageUrl ? (
                  <img
                    src={current.imageUrl}
                    alt={label}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: 12, color: "#aaa" }}>No image</span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{key}</div>
              </div>

              <label
                style={{
                  padding: "8px 16px",
                  background: isSaving ? "#ccc" : "#111",
                  color: "#fff",
                  borderRadius: 6,
                  cursor: isSaving ? "default" : "pointer",
                  fontSize: 14,
                }}
              >
                {isSaving ? "Uploading..." : "Upload new"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  disabled={isSaving}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(key, file);
                  }}
                />
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}