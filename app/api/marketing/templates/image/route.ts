//@ts-nocheck
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as any;

    if (!file || !file.name) {
      return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return new Response(JSON.stringify({ error: "Missing Supabase credentials" }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const bucket = "TemplateEmailUpload";
    const safeName = `${Date.now()}-${file.name.replace(/\s+/g, "_")}`;

    const { data, error } = await supabase.storage.from(bucket).upload(safeName, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const { data: publicData, error: urlError } = await supabase.storage.from(bucket).getPublicUrl(safeName);

    if (urlError) {
      return new Response(JSON.stringify({ error: urlError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ url: publicData.publicUrl }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 });
  }
}
