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
    const { name, email, password } = await request.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { count } = await admin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if ((count ?? 0) > 0) {
      return json({ error: "Master account already exists." }, 409);
    }

    const { data: createdUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: name },
    });

    if (createError || !createdUser.user) {
      return json({ error: createError?.message || "Could not create the master account." }, 400);
    }

    const { error: profileError } = await admin.from("profiles").insert({
      id: createdUser.user.id,
      email,
      display_name: name,
      role: "master",
      pilot_id: null,
      is_active: true,
    });

    if (profileError) {
      return json({ error: profileError.message }, 400);
    }

    const { error: auditError } = await admin.from("audit_logs").insert({
      actor_user_id: createdUser.user.id,
      entity_type: "user",
      entity_id: createdUser.user.id,
      action: "master_bootstrapped",
      detail: { email },
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
