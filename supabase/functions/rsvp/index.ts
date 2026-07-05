import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SB_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SB_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const VALID_ATTENDING = new Set(["yes", "no", "maybe"]);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed. Use POST to submit an RSVP." }, 405);
  }

  if (!SB_URL || !SB_SERVICE_KEY) {
    return json({ error: "Server is not configured." }, 500);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body." }, 400);
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!name) {
    return json({ error: "Tên là bắt buộc." }, 400);
  }

  const attending = typeof payload.attending === "string" ? payload.attending.trim() : "";
  if (!VALID_ATTENDING.has(attending)) {
    return json({ error: "Trường attending phải là 'yes', 'no' hoặc 'maybe'." }, 400);
  }

  const email = typeof payload.email === "string" && payload.email.trim() ? payload.email.trim() : null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: "Email không hợp lệ." }, 400);
  }

  const phone = typeof payload.phone === "string" && payload.phone.trim() ? payload.phone.trim() : null;

  let guests = 1;
  if (payload.guests != null) {
    const n = Number(payload.guests);
    if (!Number.isFinite(n)) {
      return json({ error: "Số khách không hợp lệ." }, 400);
    }
    guests = Math.max(0, Math.min(10, Math.floor(n)));
  }

  const meal = typeof payload.meal === "string" && payload.meal.trim() ? payload.meal.trim() : null;
  const message = typeof payload.message === "string" && payload.message.trim() ? payload.message.trim() : null;

  try {
    const supabase = createClient(SB_URL, SB_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from("rsvp")
      .insert({ name, email, phone, attending, guests, meal, message })
      .select()
      .single();

    if (error) {
      return json({ error: "Không thể lưu xác nhận. Vui lòng thử lại." }, 500);
    }

    return json({ ok: true, rsvp: data }, 201);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error.";
    return json({ error: msg }, 500);
  }
});
