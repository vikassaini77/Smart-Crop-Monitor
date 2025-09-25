# in iot/telegram_alert.py
import telegram
import json
import asyncio

async def send_telegram_alert(pest_name, image_path):
    """Sends a message and photo to a Telegram chat."""
    try:
        # Load credentials from config file
        with open('config.json', 'r') as f:
            config = json.load(f)['telegram']

        bot_token = config['bot_token']
        chat_id = config['chat_id']

        # Initialize the bot
        bot = telegram.Bot(token=bot_token)

        # Prepare the caption
        caption = f"🚨 Pest Alert! 🚨\n\nA '{pest_name}' was detected."

        # Send the photo with the caption
        async with bot:
            await bot.send_photo(chat_id=chat_id, photo=open(image_path, 'rb'), caption=caption)
        
        print(f"✅ Telegram alert sent successfully to Chat ID {chat_id}")
        return True

    except Exception as e:
        print(f"❌ Failed to send Telegram alert: {e}")
        return False

# This block allows you to test the script directly
if __name__ == '__main__':
    # Create a dummy image and config file for testing
    import os
    if not os.path.exists('test.jpg'):
        from PIL import Image
        Image.new('RGB', (100, 100), color = 'blue').save('test.jpg')
    if not os.path.exists('config.json'):
         print("ERROR: config.json not found. Please create it first.")
    else:
        print("Testing Telegram alert...")
        asyncio.run(send_telegram_alert("Test Pest", "test.jpg"))