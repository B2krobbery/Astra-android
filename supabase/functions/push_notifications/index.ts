import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { JWT } from "https://esm.sh/google-auth-library@9.6.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = "onboarding@resend.dev"; 
const FIREBASE_SA = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

async function getAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  const jwtClient = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });
  const tokens = await jwtClient.getAccessToken();
  return tokens.token as string;
}

async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  projectId: string,
  accessToken: string,
  imageUrl?: string,
  dataPayload?: Record<string, string>
) {
  const message: any = {
    token: token,
    notification: { title, body },
    android: {
      priority: "high",
      notification: {
        sound: "default",
        default_sound: true,
        default_vibrate_timings: true
      }
    },
    apns: {
      payload: {
        aps: {
          sound: "default",
          badge: 1
        }
      }
    }
  };
  
  if (dataPayload) {
    message.data = dataPayload;
  }

  if (imageUrl) {
    message.notification.image = imageUrl;
    message.android.notification.image = imageUrl;
    message.apns.payload.aps['mutable-content'] = 1;
    message.apns.fcm_options = {
      image: imageUrl
    };
  }

  const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ message })
  });
  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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
      const actionType = interaction.action_type || interaction.type;
      if (actionType !== 'LIKE') {
         return jsonResponse({ message: "Ignored non-like" });
      }

      const targetUserId = interaction.target_id || interaction.target_user_id;
      const sourceUserId = interaction.actor_id || interaction.user_id;

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

          let sourceImageUrl = sourceProfile.photo_url || sourceProfile.avatar_url;
          if (!sourceImageUrl) {
            const { data: primaryPhoto } = await supabase.from('profile_photos').select('storage_path').eq('user_id', sourceUserId).eq('is_primary', true).maybeSingle();
            if (primaryPhoto?.storage_path) {
              if (primaryPhoto.storage_path.startsWith('http')) {
                sourceImageUrl = primaryPhoto.storage_path;
              } else {
                const { data: urlData } = await supabase.storage.from('avatars').createSignedUrl(primaryPhoto.storage_path, 3600);
                if (urlData?.signedUrl) {
                  sourceImageUrl = urlData.signedUrl;
                }
              }
            }
          }

          for (const pt of pushTokens) {
            const pushResult = await sendPushNotification(
              pt.token, 
              "You got a new like! ✨", 
              `${sourceProfile.display_name} just swiped right on you.`, 
              serviceAccount.project_id, 
              accessToken,
              sourceImageUrl,
              {
                type: 'like',
                source_user_id: String(sourceUserId)
              }
            );
            console.log(`[LikePush] Push result for token ${pt.token.substring(0, 15)}...:`, JSON.stringify(pushResult));

            // Clean up unregistered tokens
            const isUnregistered = pushResult?.error?.status === 'NOT_FOUND' || 
              pushResult?.error?.message === 'NotRegistered' || 
              pushResult?.error?.details?.[0]?.errorCode === 'UNREGISTERED';
            if (isUnregistered) {
              console.log(`[LikePush] Removing unregistered token ${pt.token.substring(0, 15)}...`);
              await supabase.from('push_tokens').delete().eq('user_id', targetUserId).eq('token', pt.token);
            }
          }
        } catch (pushErr) {
          console.error("Failed to send push:", pushErr);
        }
      }

      return jsonResponse({ success: true, message: "Notifications dispatched." });
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
       return jsonResponse({ success: true, message: "Daily reminders dispatched." });
    }

    // ==========================================
    // TRIGGER 3: NEW CHAT MESSAGE
    // ==========================================
    if ((payload.type === 'INSERT' && payload.table === 'messages') || payload.action === 'send_chat_message') {
      const message = payload.record;
      if (!message) {
        return jsonResponse({ error: "Missing message record" }, 400);
      }

      const conversationId = message.conversation_id;
      const senderId = message.sender_id;
      const content = message.content || "";

      // 1. Identify recipient(s) in this conversation
      const { data: participants, error: partsErr } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', conversationId)
        .neq('user_id', senderId);

      if (partsErr || !participants || participants.length === 0) {
        console.log(`[ChatPush] No recipient found in conversation ${conversationId} for sender ${senderId}`);
        return jsonResponse({ message: "No recipient found in conversation" });
      }

      // 2. Fetch sender profile details (name and avatar)
      const { data: senderProfile } = await supabase
        .from('profiles')
        .select('id, display_name, photo_url, avatar_url, avatar_storage_path')
        .eq('id', senderId)
        .maybeSingle();

      const senderName = senderProfile?.display_name || "New Message";

      let senderImageUrl = senderProfile?.photo_url || senderProfile?.avatar_url;
      if (!senderImageUrl) {
        const { data: primaryPhoto } = await supabase
          .from('profile_photos')
          .select('storage_path')
          .eq('user_id', senderId)
          .eq('is_primary', true)
          .maybeSingle();

        const storagePath = primaryPhoto?.storage_path || senderProfile?.avatar_storage_path;
        if (storagePath) {
          if (storagePath.startsWith('http')) {
            senderImageUrl = storagePath;
          } else {
            const { data: urlData } = await supabase.storage.from('avatars').createSignedUrl(storagePath, 3600);
            if (urlData?.signedUrl) {
              senderImageUrl = urlData.signedUrl;
            }
          }
        }
      }

      // Prepare preview text
      let previewText = content;
      if (content.startsWith('http') && (content.includes('.mp3') || content.includes('.m4a') || content.includes('.webm') || content.includes('.wav'))) {
        previewText = '🎤 Voice note';
      } else if (content.startsWith('http') && (content.includes('.jpg') || content.includes('.png') || content.includes('.webp') || content.includes('.jpeg'))) {
        previewText = '📷 Photo';
      } else if (content.length > 100) {
        previewText = `${content.substring(0, 97)}...`;
      } else if (!content.trim()) {
        previewText = "Sent you a message";
      }

      // 3. For each recipient, dispatch push notification to their registered devices
      let totalDispatched = 0;
      if (FIREBASE_SA) {
        try {
          const serviceAccount = JSON.parse(FIREBASE_SA);
          const accessToken = await getAccessToken(serviceAccount.client_email, serviceAccount.private_key);

          for (const recipient of participants) {
            const { data: pushTokens } = await supabase
              .from('push_tokens')
              .select('token')
              .eq('user_id', recipient.user_id);

            if (pushTokens && pushTokens.length > 0) {
              for (const pt of pushTokens) {
                const pushResult = await sendPushNotification(
                  pt.token,
                  senderName,
                  previewText,
                  serviceAccount.project_id,
                  accessToken,
                  senderImageUrl,
                  {
                    type: 'chat_message',
                    conversation_id: String(conversationId),
                    sender_id: String(senderId),
                    sender_name: senderName
                  }
                );
                console.log(`[ChatPush] Push result for token ${pt.token.substring(0, 15)}...:`, JSON.stringify(pushResult));

                // Clean up unregistered tokens
                const isUnregistered = pushResult?.error?.status === 'NOT_FOUND' || 
                  pushResult?.error?.message === 'NotRegistered' || 
                  pushResult?.error?.details?.[0]?.errorCode === 'UNREGISTERED';
                if (isUnregistered) {
                  console.log(`[ChatPush] Removing unregistered token ${pt.token.substring(0, 15)}...`);
                  await supabase.from('push_tokens').delete().eq('user_id', recipient.user_id).eq('token', pt.token);
                } else if (pushResult?.name) {
                  totalDispatched++;
                }
              }
            }
          }
        } catch (pushErr) {
          console.error("Failed to send chat push:", pushErr);
        }
      }

      return jsonResponse({ success: true, message: `Dispatched ${totalDispatched} push notification(s) for chat.` });
    }

    return jsonResponse({ message: "Unknown payload format" });
  } catch (err: any) {
    console.error("Function Error:", err);
    return jsonResponse({ error: err.message }, 500);
  }
});
