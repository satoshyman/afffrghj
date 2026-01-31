import { Telegraf, Markup } from "telegraf";

const token = process.env.BOT_TOKEN;

if (!token) {
    console.log("❌ BOT_TOKEN is missing");
} else {
    const bot = new Telegraf(token);

  bot.start(async (ctx) => {
    const name = ctx.from?.first_name || "Player";
    const telegramId = ctx.from?.id.toString();
    const startPayload = ctx.payload;

    if (startPayload && telegramId && startPayload !== telegramId) {
      try {
        const { storage } = await import("./storage");
        const user = await storage.getUserByTelegramId(telegramId);
        if (!user) {
          const referrer = await storage.getUserByTelegramId(startPayload);
          if (referrer && referrer.telegramId !== telegramId) {
            await storage.createUser({
              telegramId: telegramId,
              username: ctx.from?.username || name,
              referrerId: referrer.id,
              balance: "0",
              level: 1,
              experience: 0,
            });
            console.log(`✅ New user ${telegramId} referred by ${referrer.telegramId}`);
          }
        }
      } catch (err) {
        console.error("Error handling referral:", err);
      }
    }

    const webAppUrl = process.env.WEBAPP_URL || "https://f-h88c.onrender.com";
    console.log(`ℹ️ Using WebApp URL: ${webAppUrl}`);

    return ctx.reply(
      `👋 Welcome, ${name}!\n🎮 Are you ready to play Ton Frog Jump?\n\nTap the button below to start the game 🐸🚀`,
      Markup.inlineKeyboard([
        Markup.button.webApp(
          "🐸 Play Ton Frog Jump",
          webAppUrl
        ),
      ])
    );
  });

  (async () => {
    try {
      await bot.launch();
      console.log("✅ Telegram bot is running...");
    } catch (err: any) {
      console.error("❌ Telegram bot failed to launch:", err && (err.message || err));
      // Specific guidance for 409 conflict (multiple getUpdates clients)
      const text = (err && (err.message || err.description || '')).toString();
      if (text.includes('Conflict') || text.includes('terminated by other getUpdates')) {
        console.error('⚠️ Telegram conflict: another bot instance is using the same BOT_TOKEN. Stop other instances (local dev or other deployed copies) or switch to webhooks.');
      }
    }
  })();
    
}
