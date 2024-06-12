import React from 'react';
import hljs from 'highlight.js/lib/core';
import php from 'highlight.js/lib/languages/php';
import javascript from 'highlight.js/lib/languages/javascript';
import html from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('html', html);
hljs.registerLanguage('php', php);

const HighlightedResponse = ({ message }) => {
    // Determine the language of the code block based on the context
    let language = 'plaintext'; // Default to plaintext if no specific language is identified

    // Check for specific languages in the message content
    if (message.includes('<script>') || message.includes('javascript')) {
        language = 'javascript';
      } else if (message.includes('<html>') || message.includes('<div>')) {
        language = 'html';
      } else if (message.includes('<?php') || message.includes('php')) {
        language = 'php';
      }

  const highlightedHTML = hljs.highlightAuto(language, message).value;

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: highlightedHTML,
      }}
    />
  );
};

export default HighlightedResponse;