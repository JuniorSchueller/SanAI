var volume = 1;

const url = new URLSearchParams(location.search);

function updateThinkingDots() {
    const thinkingElements = document.querySelectorAll('.thinking > p');
    thinkingElements.forEach(thinking => {
        let thinkingState = thinking.innerText;

        switch (thinkingState) {
            case 'SanAI está pensando':
                thinking.innerText = 'SanAI está pensando.';
                break;
            case 'SanAI está pensando.':
                thinking.innerText = 'SanAI está pensando..';
                break;
            case 'SanAI está pensando..':
                thinking.innerText = 'SanAI está pensando...';
                break;
            case 'SanAI está pensando...':
                thinking.innerText = 'SanAI está pensando';
                break;
        }
    });
}

function syncTextSize() {
    const paragraphElements = document.querySelectorAll('p');
    paragraphElements.forEach(paragraphElement => {
        const fontSize = getComputedStyle(paragraphElement).fontSize.split('px')[0];
        const configFontSize = document.querySelector('#fontSizeSlider').value;
        if (fontSize != configFontSize) {
            paragraphElement.style.fontSize = `${configFontSize}px`;
        }
    });
}

function exportChat() {
    const messageList = document.querySelector('.message-list');
    const messagesHTML = messageList.innerHTML;

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const exportHTML = `
        <html>
        <head>
            <title>Chat SanAI - ${day}/${month}/${year} ${hours}:${minutes}:${seconds}</title>
            <style>
                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background-color: #0b0d22;
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                }

                .message img.profile-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 1px solid rgba(255, 255, 255, 0.301);
                    padding: 2px;
                }

                .message-list {
                    max-height: calc(100vh - 150px); 
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 15px;
                    box-sizing: border-box; 
                }

                .message {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    max-width: 70%;
                }

                .message.user {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }

                .message.ai {
                    align-self: flex-start;
                }
				
				.message.ai .text code {
					background-color: rgba(0, 0, 0, 0.1);
					padding: 0.2em 0.4em;
					border-radius: 3px;
					font-family: monospace;
				}

				.message.ai .text pre {
					background-color: rgba(0, 0, 0, 0.2);
					padding: 10px;
					border-radius: 5px;
					overflow: auto;
					font-family: monospace;
				}

                .message .profile-icon {
                    font-size: 32px;
                    color: #ccc;
                }

                .message.user .profile-icon {
                    color: #888;
                }

                .message .text {
                    padding: 15px;
                    border-radius: 10px;
                    font-size: 16px;
                    line-height: 1.5;
                    flex-grow: 1;
                }

                .message.user .text {
                    background-color: #ffffff7c;
                    color: #ffffff;
                    border-top-right-radius: 0;
                }

                .message.ai .text {
                    background-color: #ffffff7c;
                    color: #ffffff;
                    border-top-left-radius: 0;
                    position: relative;
                }

                .listen-icon {
                    position: absolute;
                    bottom: -20px;
                    right: 10px;
                    font-size: 18px;
                    color: #fff;
                }

                .listen-icon.loading {
                    color: #ff9900;
                    pointer-events: none;
                }

                .thinking p {
                    color: #ccc;
                    font-style: italic;
                    font-weight: bold;
                    animation: blinkThinking 1.5s infinite;
                }

                .error p {
                    color: #ff7979;
                    font-weight: bold;
                    position: relative;
                    animation: blinkError 1.5s infinite;
                }

                @keyframes blinkThinking {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                @keyframes blinkError {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                @keyframes gradientText {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        </head>
        <body>
            <div class="message-list">
                ${messagesHTML}
            </div>
        </body>
        </html>
    `;

    const blob = new Blob([exportHTML], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'chat_sanai.html';
    link.click();
}

function sendMessage(msg) {
    const greetingContainer = document.querySelector('div.greeting-container');

    if (greetingContainer.style.display === '' || greetingContainer.style.display === 'block') {
        greetingContainer.style.display = 'none';
    }

    const messageList = document.querySelector('.message-list');

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'user');

    const userImage = document.createElement('img');
    userImage.src = document.querySelector('#userAvatar').value;
    userImage.classList.add('profile-icon');

    const textContainer = document.createElement('div');
    textContainer.classList.add('text');

    const textContainerText = document.createElement('p');
    textContainerText.innerText = msg;

    textContainer.appendChild(textContainerText);

    messageElement.appendChild(userImage);
    messageElement.appendChild(textContainer);

    messageList.appendChild(messageElement);

    setTimeout(async () => {
        const aiMessageElement = document.createElement('div');
        aiMessageElement.classList.add('message', 'ai');

        const aiImage = document.createElement('img');
        aiImage.src = './assets/images/SanAI.png';
        aiImage.classList.add('profile-icon');

        const aiTextContainer = document.createElement('div');
        aiTextContainer.classList.add('text', 'thinking');

        const aiTextContainerText = document.createElement('p');
        aiTextContainerText.innerText = 'SanAI está pensando';
        aiTextContainer.appendChild(aiTextContainerText);

        /*const icon = document.createElement('i');
        icon.classList.add('fas', 'fa-volume-up', 'listen-icon');
        icon.setAttribute('title', 'Ouvir Resposta');
        icon.style.cursor = 'pointer';*/

        aiMessageElement.appendChild(aiImage);
        aiMessageElement.appendChild(aiTextContainer);
        //aiTextContainer.appendChild(icon);

        messageList.appendChild(aiMessageElement);

        let queryVars = '';
        if (url.has('id') && url.get('id')) {
            queryVars = `?chatId=${url.get('id')}`;
        }

        const generateResponse = await fetch(`/api/generate${queryVars}`, {
            method: 'POST',
            body: JSON.stringify({'prompt': msg}),
            headers: {
                'Content-Type': 'application/json',
                'cookies': document.cookie,
            }            
        });

        const aiReply = await generateResponse.json();

        if (aiReply['status'] === 200) {
            aiTextContainerText.innerHTML = marked.parse(aiReply['message']);
            aiTextContainer.classList.remove('thinking');

            if (queryVars.replaceAll(' ', '').length <= 0) {
                location.href = './chat?id=' + aiReply['chatId'];
            }
        } else {
            aiTextContainer.classList.remove('thinking');
            aiTextContainer.classList.add('error');
            aiTextContainerText.innerText = 'Ops... SanAI não conseguiu te responder.';
        }

        const messageTextInput = document.querySelector('.footer > #messageText');
        const messageTextSend = document.querySelector('.footer > #sendMessage');
        messageTextInput.removeAttribute('disabled');
        messageTextSend.removeAttribute('disabled');

        messageList.scrollTop = messageList.scrollHeight;
    }, 200);

    const messageTextInput = document.querySelector('.footer > #messageText');
    const messageTextSend = document.querySelector('.footer > #sendMessage');
    messageTextInput.setAttribute('disabled', '');
    messageTextSend.setAttribute('disabled', '');

    messageList.scrollTop = messageList.scrollHeight;
}

document.addEventListener('DOMContentLoaded', () => {
    setInterval(updateThinkingDots, 100);
    setInterval(syncTextSize, 100);  

    if (url.has('id') && url.get('id')) {
        document.querySelector('.greeting-container').style.display = 'none';
        setTimeout(() => {
            messageList.scrollTop = messageList.scrollHeight;
        }, 1000);
    }

    const modals = document.querySelectorAll('.modal');
    const settingsModal = document.querySelector('#settingsModal');
    const loginModal = document.querySelector('#loginModal');
    const logoutButton = document.querySelector('#logoutButton');
    const openSettings = document.querySelector('#openSettings');
    const closeSettings = document.querySelector('#closeSettings');
    const closeLogin = document.querySelector('#closeLogin');
    const openLogin = document.querySelector('#openLogin');
    const clearChat = document.querySelector('#clearChat');
    const fontSize = document.querySelector('#fontSizeSlider');
    const voiceVolume = document.querySelector('#voiceVolumeSlider');
    const sendMessageBtn = document.querySelector('#sendMessage');
    const exportChatButton = document.querySelector('#exportChat');

    function removeEmojis(text) {
        return text.replace(/[^\w\s,.!?;'"-]/g, '');
    }

    function readText(text, icon) {

        const cleanedText = removeEmojis(text);

        const allListenIcons = document.querySelectorAll('.listen-icon');
        allListenIcons.forEach(icon => icon.style.pointerEvents = 'none');

        icon.classList.add('loading');

        const speech = new SpeechSynthesisUtterance(cleanedText);
        speech.lang = 'pt-BR';  
        speech.volume = volume;      
        speech.rate = 2.5;        
        speech.pitch = 1;       

        speech.onend = () => {

            allListenIcons.forEach(icon => icon.style.pointerEvents = 'auto');
            icon.classList.remove('loading');
        };

        speechSynthesis.speak(speech);
    }

    document.querySelectorAll('.listen-icon').forEach(icon => {
        icon.addEventListener('click', () => {

            if (icon.classList.contains('loading')) {
                return; 
            }

            const messageText = icon.closest('.text').querySelector('p').innerText;
            readText(messageText, icon);
        });
    });


    function closeAllModals() {
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    openSettings.addEventListener('click', () => {
        closeAllModals();
        settingsModal.style.display = 'block';
    });

    closeSettings.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });

    closeLogin.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    openLogin.addEventListener('click', () => {
        closeAllModals();
        loginModal.style.display = 'block';
    });

    logoutButton.addEventListener('click', () => {
        location.href = './logout';
    });

    window.addEventListener('click', (event) => {
        if (event.target === settingsModal || event.target === loginModal) {
            event.target.style.display = 'none';
        }
    });

    clearChat.addEventListener('click', () => {
        if (url.has('id') && url.get('id')) {
            fetch(`/api/deleteChat?chatId=${url.get('id')}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'cookies': document.cookie,
                }  
            });
            
            location.href = './chat';
        } else {
            const greetingContainer = document.querySelector('div.greeting-container');
            greetingContainer.style.display = '';
            document.querySelector('.message-list').innerHTML = '';
        }
    });

    if (localStorage.getItem('fontSize')) {
        fontSize.value = localStorage.getItem('fontSize');
        const elements = document.querySelectorAll('p');
        elements.forEach(element => {
            element.style.fontSize = localStorage.getItem('fontSize') + 'px';
        });
    }

    fontSize.addEventListener('input', (event) => {
        localStorage.setItem('fontSize', event.target.value);
        const elements = document.querySelectorAll('p');
        elements.forEach(element => {
            element.style.fontSize = event.target.value + 'px';
        });
    });

    if (localStorage.getItem('voiceVolume')) {
        voiceVolume.value = localStorage.getItem('voiceVolume');
        volume = parseFloat(localStorage.getItem('voiceVolume'));
    }

    voiceVolume.addEventListener('input', (event) => {
        localStorage.setItem('voiceVolume', event.target.value);
        volume = parseFloat(event.target.value);
    });

    messageText.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {  
            event.preventDefault();  
            if (messageText.value.replaceAll(' ', '') !== '') {
                sendMessage(messageText.value);
                messageText.value = ''; 
            } else {
                Toastify({
                    text: "Mensagem não pode ser vazia!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    style: {
                        background: "linear-gradient(to left, rgb(167, 0, 0), rgb(226, 0, 0), rgb(255, 0, 0))",
                    },
                }).showToast();
            }
        }
    });

    sendMessageBtn.addEventListener('click', () => { 
        if (!sendMessageBtn.hasAttribute('disabled')) {
            if (messageText.value.replaceAll(' ', '') !== '') {
                sendMessage(messageText.value);
                messageText.value = '';  
            } else {
                Toastify({
                    text: "Mensagem não pode ser vazia!",
                    duration: 3000,
                    gravity: "bottom",
                    position: "right",
                    stopOnFocus: true,
                    style: {
                        background: "linear-gradient(to left, rgb(167, 0, 0), rgb(226, 0, 0), rgb(255, 0, 0))",
                    },
                }).showToast();
            }
        }
    });

    exportChatButton.addEventListener('click', exportChat);
});