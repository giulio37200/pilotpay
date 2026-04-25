import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authorization = request.headers.get("Authorization") ?? "";
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const {
      data: { user },
      error: userError,
    } = await client.auth.getUser();

    if (userError || !user) {
      return json({ error: "Unauthorized." }, 401);
    }

    const { data: callerProfile, error: profileError } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || callerProfile?.role !== "master") {
      return json({ error: "Only the master account can create internal users." }, 403);
    }

    const { name, email, password, role, pilotId } = await request.json();

    if (!name || !email || !password) {
      return json({ error: "Name, email, and password are required." }, 400);
    }

    if (!['finance', 'pilot'].includes(role)) {
      return json({ error: "Role must be finance or pilot." }, 400);
    }

    if (role === "pilot" && !pilotId) {
      return json({ error: "Pilot accounts must be linked to a pilot profile." }, 400);
    }

    const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name },
    });

    if (createError || !createdUser.user) {
      return json({ error: createError?.message || "Could not create the internal account." }, 400);
    }

    const { error: insertProfileError } = await admin.from("profiles").insert({
      id: createdUser.user.id,
      email,
      display_name: name,
      role,
      pilot_id: role === "pilot" ? pilotId : null,
      is_active: true,
    });

    if (insertProfileError) {
      return json({ error: insertProfileError.message }, 400);
    }

    const { error: auditError } = await admin.from("audit_logs").insert({
      actor_user_id: user.id,
      entity_type: "user",
      entity_id: createdUser.user.id,
      action: "user_created",
      detail: { email, role },
    });

    if (auditError) {
      return json({ error: auditError.message }, 400);
    }

    return json({ ok: true });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Unknown error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}
