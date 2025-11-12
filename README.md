# High Desert AI Website

A modern website for High Desert AI LLC featuring an AI-powered consulting chatbot. The site provides information about the company and allows visitors to interact with an AI assistant to learn about AI consulting services.

## Features

- **Clean, Minimal Design** - Simple single-page site with company branding
- **AI Chatbot Widget** - Interactive chat interface powered by Claude AI (Sonnet 4.5)
- **Persistent Conversations** - Chat history saved locally and resets daily
- **Mobile Responsive** - Full-screen chat experience on mobile devices
- **Serverless Backend** - Netlify Functions for API integration
- **Professional UI** - Modern design with typing indicators and smooth animations

## Tech Stack

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Backend**: Netlify Functions (Node.js)
- **AI**: Claude API (Sonnet 4.5) via Anthropic SDK
- **Hosting**: Netlify
- **Storage**: Browser localStorage for conversation persistence

## File Structure

```
/
├── index.html                      # Main website page
├── styles.css                      # Chat widget styling
├── chat.js                         # Frontend chat logic
├── package.json                    # Dependencies
├── netlify.toml                    # Netlify configuration
├── netlify/
│   └── functions/
│       └── chat.js                 # Serverless API endpoint
├── high-desert-ai-logo.png        # Company logo
└── high-desert-ai-mountain-logo.png # Mountain logo
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@anthropic-ai/sdk` - For Claude API integration
- `netlify-cli` - For local development (optional)

### 2. Set Up Environment Variables

You need to add your Anthropic API key to Netlify:

#### On Netlify Dashboard:
1. Go to your site in Netlify dashboard
2. Navigate to **Site settings** > **Environment variables**
3. Click **Add a variable**
4. Set:
   - **Key**: `ANTHROPIC_API_KEY`
   - **Value**: Your Anthropic API key (starts with `sk-ant-`)
5. Click **Save**

#### For Local Development:
Create a `.env` file in the root directory:

```bash
ANTHROPIC_API_KEY=your-api-key-here
```

**Note**: Never commit your `.env` file to version control!

### 3. Deploy to Netlify

#### Option A: Deploy from Git (Recommended)

1. Push your code to GitHub
2. In Netlify dashboard, click **Add new site** > **Import an existing project**
3. Connect to your GitHub repository
4. Configure build settings:
   - **Build command**: (leave empty)
   - **Publish directory**: `.` (root)
5. Add environment variable `ANTHROPIC_API_KEY`
6. Click **Deploy site**

#### Option B: Manual Deploy

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

### 4. Get Your Anthropic API Key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to **API Keys**
4. Click **Create Key**
5. Copy the key (starts with `sk-ant-`)
6. Add it to Netlify as described in step 2

## Local Development

### Test Locally with Netlify Dev

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Create .env file with your API key
echo "ANTHROPIC_API_KEY=your-api-key-here" > .env

# Start local dev server
netlify dev
```

This will:
- Serve your site at `http://localhost:8888`
- Run Netlify Functions locally
- Load environment variables from `.env`

### Test Without Netlify CLI

You can open `index.html` directly in a browser, but the chat function will not work without the serverless backend. For full testing, use `netlify dev`.

## How the Chatbot Works

### Frontend (`chat.js`)
1. Displays chat widget in bottom-right corner
2. Manages conversation history (last 20 messages)
3. Stores messages in localStorage
4. Automatically resets conversation daily
5. Sends user messages with last 10 messages as context

### Backend (`netlify/functions/chat.js`)
1. Receives POST requests with message and history
2. Calls Claude API with system instructions
3. Returns AI response
4. Handles errors and rate limiting

### System Instructions
The chatbot is configured as an AI consulting assistant that:
- Teaches AI mindset shifts, not just technical solutions
- Provides practical, actionable advice
- Focuses on sustainable implementation
- Avoids AI hype and unrealistic expectations

## API Usage and Costs

### Claude API Pricing
- Model: `claude-sonnet-4-5-20250929`
- Cost: ~$3 per million input tokens, ~$15 per million output tokens
- Average conversation: ~2,000 tokens total (~$0.05 per interaction)
- $1,000 credit = ~20,000 conversations

### Rate Limits
- Default: 50 requests per minute
- Adjust `max_tokens` in `netlify/functions/chat.js` if needed

## Customization

### Change AI Personality
Edit the `SYSTEM_INSTRUCTIONS` constant in `netlify/functions/chat.js`

### Modify Chat Appearance
Edit styles in `styles.css`:
- Colors: Search for `#0066cc` (primary blue)
- Sizes: Adjust `.chat-window` width/height
- Mobile: Edit `@media (max-width: 480px)` section

### Adjust Conversation Length
In `chat.js`:
- `maxStoredMessages`: Number of messages saved (default: 20)
- `maxContextMessages`: Number sent to API (default: 10)

### Change Welcome Message
In `chat.js`, edit the `showWelcomeMessage()` method

## Testing Checklist

- [ ] Chat opens and closes smoothly
- [ ] Messages send and display correctly
- [ ] Typing indicator shows while waiting
- [ ] Conversation history persists on refresh
- [ ] Conversation resets on new day
- [ ] Mobile responsive design works
- [ ] Error handling for failed API calls
- [ ] CORS configured correctly
- [ ] Environment variable set in Netlify

## Troubleshooting

### Chat button appears but doesn't send messages
- Check browser console for errors
- Verify `ANTHROPIC_API_KEY` is set in Netlify
- Check Netlify Functions logs in dashboard

### "API configuration error" message
- Environment variable `ANTHROPIC_API_KEY` is not set
- Add it in Netlify dashboard under Site settings > Environment variables

### 429 Rate Limit Error
- Too many requests in short time
- Wait a few seconds and try again
- Consider increasing rate limit with Anthropic

### Conversation doesn't persist
- Check browser localStorage is enabled
- Try in incognito/private window to test clean state

### Function deploy fails
- Ensure `package.json` is committed
- Check Netlify build logs
- Verify Node.js version compatibility

## Support

For issues or questions:
- **Website**: [highdesertai.com](https://highdesertai.com)
- **Email**: jon@highdesertai.com
- **Phone**: 610-999-9699

## License

MIT License - See LICENSE file for details

---

Built with ❤️ by High Desert AI LLC in Bend, Oregon
