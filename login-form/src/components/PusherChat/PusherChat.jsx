import React, { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import Axios from 'axios';
import './Chat.css';
import { API_BASE_URL, ACCESS_TOKEN_NAME, ACCESS_USER_DATA, API_DEFAULT_LANGUAGE } from "../../constants/apiConstants";
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
  en: {
    send: "Send",
    typing: "is typing...",
    box: "Write a message..."
  },
  fi: {
    send: "Lähetä",
    typing: "kirjoittaa...",
    box: "Kirjoita viesti..."
  }
});

const App = () => {
  const [username, setUsername] = useState(localStorage.getItem(ACCESS_USER_DATA) || 'Guest');
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [typingIndicator, setTypingIndicator] = useState('');
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  var query = window.location.search.substring(1);
  var urlParams = new URLSearchParams(query);
  var localization = urlParams.get('lang');

  if (localization == null) {
    strings.setLanguage(API_DEFAULT_LANGUAGE);
  } else {
    strings.setLanguage(localization);
  }

  useEffect(() => {
    fetchUsername();
    const cleanup = initializePusher();

    Axios.get(`${API_BASE_URL}/api/messages`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    })
    .then((response) => {
        setMessages(response.data);
    })
    .catch((error) => console.error('Failed to fetch messages', error));

    return cleanup;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializePusher = () => {
    const pusher = new Pusher('your_pusher_key', { cluster: 'your_cluster' });
    const channel = pusher.subscribe('chat');

    channel.bind('message', (newMessage) => {
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
    });

    channel.bind('user-typing', ({ username: typingUsername, isTyping }) => {
        if (isTyping) {
            setTypingIndicator(`${typingUsername} ${strings.typing}`);
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setTypingIndicator('');
            }, 1000);
        }
    });
    

    return () => {
        channel.unbind_all();
        channel.unsubscribe();
        clearTimeout(typingTimeoutRef.current);
    };
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUsername = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_NAME);
    if (!token) return;
    try {
      const { data } = await Axios.get(`${API_BASE_URL}/api/users/userdata`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setUsername(data.name);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 500);
    sendTypingStatus(true);
  };

  const sendTypingStatus = async (isTyping) => {
    await Axios.post(`${API_BASE_URL}/api/typing`, { username, isTyping }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    }).catch((error) => console.error('Error sending typing status', error));
  };

  const submitMessage = async (e) => {
    e.preventDefault();
    await Axios.post(`${API_BASE_URL}/api/messages`, { username, message }, {
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem(ACCESS_TOKEN_NAME)}` },
    });
    setMessage('');
    sendTypingStatus(false);
  };
  
  return (
    <div className="chat-container">
      <div className="messages-list">
        {[...messages].reverse().map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.username}: </strong>
            <span>{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {typingIndicator && <div className="typing-indicator">{typingIndicator}</div>}
      <form onSubmit={submitMessage} className="message-form">
        <input
          className="message-input"
          placeholder={strings.box}
          value={message}
          onChange={handleTyping}
        />
        <button type="submit" className="send-button">{strings.send}</button>
      </form>
    </div>
  );
  
  
};


export default App;