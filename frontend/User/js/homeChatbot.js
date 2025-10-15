// ✅ Toggle chat window visibility
const chatToggleBtn = document.getElementById('chat-toggle-btn');
const chatboxContainer = document.getElementById('chatbox-container');
const chatMessages = document.getElementById('chatbox-messages');
const userMessageInput = document.getElementById('userMessage');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const newChatBtn = document.getElementById('newChatBtn');

chatToggleBtn.addEventListener('click', () => {
    chatboxContainer.style.display =
        chatboxContainer.style.display === 'flex' ? 'none' : 'flex';
    chatboxContainer.style.flexDirection = 'column';
});

// ✅ Clear chat - New Chat
newChatBtn.addEventListener('click', () => {
    chatMessages.innerHTML = '';
});

// ✅ Shift + Enter = New Line
userMessageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevents newline
        sendMessageBtn.click();
    }
});

// ✅ Add message in Messenger style
function addMessage(sender, message, isUser = false) {
    const msgWrapper = document.createElement('div');
    msgWrapper.style.display = 'flex';
    msgWrapper.style.marginBottom = '10px';
    msgWrapper.style.alignItems = 'flex-end';

    const msgBubble = document.createElement('div');
    msgBubble.textContent = message;
    msgBubble.style.padding = '10px 14px';
    msgBubble.style.borderRadius = '15px';
    msgBubble.style.maxWidth = '70%';
    msgBubble.style.fontSize = '14px';
    msgBubble.style.wordWrap = 'break-word';
    msgBubble.style.whiteSpace = 'pre-wrap';

    if (isUser) {
        msgWrapper.style.justifyContent = 'flex-end';
        msgBubble.style.backgroundColor = '#3498db';
        msgBubble.style.color = '#fff';
        msgBubble.style.borderBottomRightRadius = '3px';
    } else {
        msgWrapper.style.justifyContent = 'flex-start';

        const icon = document.createElement('img');
        icon.src = 'https://cdn-icons-png.flaticon.com/512/4712/4712109.png';
        icon.alt = 'AI';
        icon.style.width = '30px';
        icon.style.height = '30px';
        icon.style.marginRight = '8px';

        msgWrapper.appendChild(icon);

        msgBubble.style.backgroundColor = '#f1f1f1';
        msgBubble.style.color = '#000';
        msgBubble.style.borderBottomLeftRadius = '3px';
    }

    msgWrapper.appendChild(msgBubble);
    chatMessages.appendChild(msgWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ✅ Add Loading
function addLoadingMessage() {
    const loadingMsg = document.createElement('div');
    loadingMsg.style.display = 'flex';
    loadingMsg.style.alignItems = 'center';
    loadingMsg.style.marginBottom = '10px';

    const text = document.createElement('span');
    text.textContent = 'AI: ';
    loadingMsg.appendChild(text);

    const dots = document.createElement('span');
    dots.textContent = '.';
    dots.style.marginLeft = '4px';
    loadingMsg.appendChild(dots);

    chatMessages.appendChild(loadingMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    let dotCount = 1;
    const interval = setInterval(() => {
        dotCount = (dotCount % 3) + 1;
        dots.textContent = '.'.repeat(dotCount);
    }, 400);

    return { loadingMsg, interval };
}

// ✅ Auto-authenticate once
(async function autoAuth() {
    try {
        if (puter?.auth?.signInAnonymously) {
            await puter.auth.signInAnonymously();
        } else if (puter?.auth?.anonymous) {
            await puter.auth.anonymous();
        } else if (puter?.auth?.signIn) {
            await puter.auth.signIn();
        } else {
            console.error("No valid Puter auth method found.");
        }
        console.log("✅ Auto signed-in");
    } catch (err) {
        console.error("Auth Error:", err);
    }
})();

// ✅ Send message
sendMessageBtn.addEventListener('click', async () => {
    const message = userMessageInput.value.trim();
    if (!message) return;

    addMessage('You', message, true);
    userMessageInput.value = '';

    const { loadingMsg, interval } = addLoadingMessage();

    try {
        const aiReply = await puter.ai.chat(message);
        clearInterval(interval);
        chatMessages.removeChild(loadingMsg);
        addMessage('AI', aiReply || 'No response', false);
    } catch (error) {
        clearInterval(interval);
        chatMessages.removeChild(loadingMsg);
        console.error(error);
        addMessage('AI', 'Error connecting to AI service.', false);
    }
});
