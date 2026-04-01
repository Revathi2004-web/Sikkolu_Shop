import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language, orders } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const langInstruction = language === 'te'
      ? 'Respond in Telugu (తెలుగు).'
      : language === 'hi'
      ? 'Respond in Hindi (हिंदी).'
      : 'Respond in English.';

    const ordersContext = orders && orders.length > 0
      ? `\n\nCustomer's recent orders:\n${JSON.stringify(orders, null, 2)}`
      : '\n\nThis customer has no orders yet.';

    const systemPrompt = `You are a friendly customer service assistant for "Srikakulam Specials", an e-commerce store.
${langInstruction}

Core Responsibilities:
- Provide order status updates when asked
- Help with order issues (cancellations, returns)
- Answer product questions
- Be polite, empathetic, and concise
- If an order is cancelled or has issues, ask if they'd like to contact support

Order workflow: Customer places order → Admin confirms → Customer pays & uploads screenshot → Admin approves payment → Shipped → Delivered.
Cancellations allowed only for "pending" or "confirmed" orders. Returns allowed within 7 days of delivery.

Keep responses brief (2-4 sentences). Use emojis sparingly for friendliness.
${ordersContext}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Customer assistant error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
