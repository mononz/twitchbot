# Twitch Bot

This repo is a fork of https://github.com/beerent/thedevdadbot

### What does this bot do?

 - Listens for chat commands via the chat client
 - Post messages to chat via the chat client
 - Configures the twitch PubSub client to listen for subscriptions, bit redeems and channel point redemptions

### What will this bot do?

 - Great question...
 - Configure custom commands
 - Dynamic creation of custom commands (todo update with root repo)
 - Scene switcher in OBS (using advanced scene switcher - docs required)
 - Philips Hue light changer - channel redeem points (todo)

### Twitch Application Setup

1. Copy the .env.sample file to a new .env file
   - Fill in your 'TWITCH_USERNAME' and 'TWITCH_CHANNELS' i.e. "mono_nz"
2. Create a twitch developer application at https://dev.twitch.tv/console
   - Set the redirect URL as `https://twitchapps.com/tokengen/`
   - Copy the client id from the twitch developer application to your .env file to 'TWITCH_CLIENT_ID'
3. Open the website https://twitchapps.com/tokengen/
   - Paste in your client id
   - in scopes, paste in `chat:edit channel:read:redemptions channel:manage:redemptions channel:read:vips chat:read channel:read:subscriptions bits:read moderator:read:followers`
   - Press connect, and approve the twitch oauth flow
   - Copy the access token and put it into your .env at 'TWITCH_ACCESS_TOKEN'

### Run the project

1. run `npm ci` in terminal in the project directory
2. run `npm run dev` if on mac/linux or `npm run devWindows` if on windows

### Test the project

1. Open to https://dashboard.twitch.tv/ and open your stream manager
2. Type into chat `!ping`, the bot should respond with `pong @user`
3. In the bottom left of the chat window. Redeem a channel point
   - Observe your node console to read the redeem result logged in the terminal