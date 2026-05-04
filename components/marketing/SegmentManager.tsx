"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import SegmentModal from "./SegmentModal";
import { useRouter } from "next/navigation";

type Segment = {
  id: string;
  name: string;
  description?: string;
  type: string;
  filters?: any;
  cachedCount?: number;
};

export default function SegmentManager() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [name, setName] = useState("");
  const [statusFilter, setStatusFilter] = useState("NEW");
  const [preview, setPreview] = useState<any>(null);
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();

  const load = async () => {
    try {
      const res = await axios.get("/api/marketing/segments");
      console.log("[SEGMENTS_LOAD_RESP]", res.data);
      setSegments(res.data.data || []);
    } catch (e) {
      console.error("[SEGMENTS_LOAD_ERR]", e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  

  const handleCreateFromModal = async (payload: any) => {
    await axios.post("/api/marketing/segments", payload);
    load();
  };

 

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Segments</h3>
          <div>
            <button
              className="mr-2 px-3 py-1 rounded border"
              onClick={() => setOpenModal(true)}
            >
              New Segment
            </button>
            <button className="px-3 py-1 rounded border" onClick={load}>
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {segments.map((s) => (
            <div
              key={s.id}
              className="p-4 border rounded-lg hover:shadow transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {s.description}
                  </div>
                  <div className="text-xs mt-2 text-muted-foreground">
                    Type: {s.type === "STATIC" ? "Static" : "Dynamic"}
                  </div>
                </div>
                <div className="text-sm">{s.cachedCount ?? "-"}</div>
              </div>

              <div className="mt-3 flex justify-end items-center">
                <div className="flex items-center gap-2">
                  {s.type === 'DYNAMIC' && (
                    <button
                      className="text-sm px-2 py-1 rounded border"
                      onClick={() => router.push(`/marketing/segments/${s.id}`)}
                    >
                      View
                    </button>
                  )}
                  <button
                    className="text-sm px-2 py-1 rounded border text-red-600"
                    onClick={async () => {
                      if (!confirm(`Delete segment "${s.name}"? This cannot be undone.`)) return;
                      try {
                        await axios.delete(`/api/marketing/segments/${s.id}`);
                        load();
                      } catch (e) {
                        console.error(e);
                        alert('Delete failed');
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SegmentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onCreate={handleCreateFromModal}
      />
    </div>
  );
}
