import React, { useEffect, useState, useRef } from 'react';
import { Parser } from 'html-to-react'; // Assuming you're using this library
import { API_BASE_URL } from "../../constants/apiConstants";
import LocalizedStrings from 'react-localization';

let strings = new LocalizedStrings({
    en: {
      your_browser_not_support_video_tag: "Your browser does not support the video tag.",
    },
    fi: {
      your_browser_not_support_video_tag: "Selaimesi ei tue video tagia.",
    },
    se: {
      your_browser_not_support_video_tag: "Din webbläsare stöder inte videomarkeringen.",
    }
  });

const MessageList = ({ messages, DefaultMaleImage, DefaultFemaleImage }) => {
  const parser = new Parser(); // Create the HTML parser instance
  const messagesEndRef = useRef(null);

  const processedMessages = Array.isArray(messages)
  ? [...messages].map((msg) => { 
    const profilePicUrl = msg.profile_picture_path
    ? `${API_BASE_URL}${msg.profile_picture_path.replace('public/uploads', '/storage/uploads')}`
    : null;
  const defaultImg = msg.gender === 'male' ? DefaultMaleImage : DefaultFemaleImage;

  return {
    ...msg,
    parsedMessage: parser.parse(msg.message), // Parse HTML content here
    profilePicUrl,
    defaultImg
  }; })
  : [];

  const renderMessageImageOrVideo = (msg) => {
    if (msg.image_path) {
      const imageUrl = API_BASE_URL + '/' + msg.image_path;
      if (msg.type === 'image') {
        return (<><br /><br /><img src={imageUrl} className="message-image" alt="Uploaded" /></>);
      } else {
        return  (<><br /><br /><video
                  controls
                  className='Webcam-video'
                >
                  <source
                    src={imageUrl}
                    type="video/mp4"
                  />
                  {strings.your_browser_not_support_video_tag}
                </video></>);
      }
    }
    return null;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="messages-list">
      {[...processedMessages].reverse().map((msg, index) => (
        <div key={index} className="message">
          <div className='message-date'>
            <strong>{msg.username}: </strong>
            <i>{msg.formatted_created_at}</i>
          </div>
          <div className='massage-container'>
            <img src={msg.profilePicUrl || msg.defaultImg} className='message-avatar' alt={`Profile of ${msg.username}`} />
            <span>{msg.parsedMessage}</span>
            {/* Render image if image_path is not null */}
            {renderMessageImageOrVideo(msg)}
            <div className='message-clear' />
          </div>
        </div>
      ))}
      {/* Scroll to this ref to show the latest message */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;