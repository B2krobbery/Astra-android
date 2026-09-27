import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { JWT } from "https://esm.sh/google-auth-library@9.6.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "onboarding@resend.dev"; 
const FIREBASE_SA = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const jwtClient = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });
  const tokens = await jwtClient.getAccessToken();
  return tokens.token as string;
}

async function sendPushNotification(token: string, title: string, body: string, projectId: string, accessToken: string) {
  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      message: {
        token: token,
        notification: { title, body }
      }
    })
  });
  return response.json();
}

serve(async (req) => {
  try {
    const payload = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ==========================================
    // TRIGGER 1: SOMEONE LIKED YOU
    // ==========================================
    if (payload.type === 'INSERT' && payload.table === 'interactions') {
      const interaction = payload.record;
      if (interaction.type !== 'LIKE') {
         return new Response(JSON.stringify({ message: "Ignored non-like" }), { headers: { "Content-Type": "application/json" } });
      }

      const targetUserId = interaction.target_user_id;
      const sourceUserId = interaction.user_id;

      const { data: targetProfile } = await supabase.from('profiles').select('*').eq('id', targetUserId).single();
      const { data: sourceProfile } = await supabase.from('profiles').select('*').eq('id', sourceUserId).single();

      if (!targetProfile || !sourceProfile) {
        throw new Error("Profiles not found");
      }

      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(targetUserId);

      // --- SEND EMAIL NOTIFICATION ---
      if (RESEND_API_KEY && authUser?.email) {
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: `Astra Matchmaking <${FROM_EMAIL}>`,
            to: [authUser.email],
            subject: "Someone liked your profile! ✨",
            html: `<p>Hi ${targetProfile.display_name},</p><p>Great news! <strong>${sourceProfile.display_name}</strong> just swiped right on your profile.</p><p>Open Astra to see if it's a cosmic match!</p>`
          })
        }).catch(console.error);
      }

      // --- SEND PUSH NOTIFICATION (Phone) ---
      const { data: pushTokens } = await supabase.from('push_tokens').select('token').eq('user_id', targetUserId);
      if (pushTokens && pushTokens.length > 0 && FIREBASE_SA) {
        try {
          const serviceAccount = JSON.parse(FIREBASE_SA);
          const accessToken = await getAccessToken(serviceAccount.client_email, serviceAccount.private_key);
          
          for (const pt of pushTokens) {
            const pushResult = await sendPushNotification(
              pt.token, 
              "You got a new like! ✨", 
              `${sourceProfile.display_name} just swiped right on you.`, 
              serviceAccount.project_id, 
              accessToken
            );
            console.log("Push result:", pushResult);
          }
        } catch (pushErr) {
          console.error("Failed to send push:", pushErr);
        }
      }

      return new Response(JSON.stringify({ success: true, message: "Notifications dispatched." }), { headers: { "Content-Type": "application/json" } });
    }

    // ==========================================
    // TRIGGER 2: DAILY ONBOARDING REMINDER
    // ==========================================
    if (payload.action === 'daily_reminder') {
       const { data: incompleteProfiles } = await supabase.from('profiles').select('id, display_name').is('bio', null).limit(50);
       
       if (incompleteProfiles && incompleteProfiles.length > 0) {
         let accessToken = null;
         let serviceAccount = null;
         if (FIREBASE_SA) {
           serviceAccount = JSON.parse(FIREBASE_SA);
           accessToken = await getAccessToken(serviceAccount.client_email, serviceAccount.private_key).catch(() => null);
         }

         for (const p of incompleteProfiles) {
           const { data: { user: authUser } } = await supabase.auth.admin.getUserById(p.id);
           if (RESEND_API_KEY && authUser?.email) {
             fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${RESEND_API_KEY}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  from: `Astra Matchmaking <${FROM_EMAIL}>`,
                  to: [authUser.email],
                  subject: "Complete your Astra Profile! 🚀",
                  html: `<p>Hi ${p.display_name},</p><p>Your cosmic match is waiting! You can't receive matches until you finish setting up your profile.</p><p>Log in today to complete your Vedic astrology chart and start swiping!</p>`
                })
              }).catch(console.error);
           }
           
           if (accessToken && serviceAccount) {
              const { data: ptTokens } = await supabase.from('push_tokens').select('token').eq('user_id', p.id);
              if (ptTokens && ptTokens.length > 0) {
                for (const pt of ptTokens) {
                  await sendPushNotification(
                    pt.token, 
                    "Finish your profile! 🚀", 
                    "Complete your Vedic chart to start getting matches.", 
                    serviceAccount.project_id, 
                    accessToken
                  ).catch(console.error);
                }
              }
           }
         }
       }
       return new Response(JSON.stringify({ success: true, message: "Daily reminders dispatched." }), { headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ message: "Unknown payload format" }), { headers: { "Content-Type": "application/json" } });
  } catch (err: any) {
    console.error("Function Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
