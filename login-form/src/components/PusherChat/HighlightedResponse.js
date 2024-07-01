import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css'; // or your preferred highlight.js theme

const customComponents = {
  code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
          <div>
              <pre className="code-block" {...props}>
                  {children}
              </pre>
          </div>
      ) : (
          <code className="code-block" {...props}>
              {children}
          </code>
      );
  },
};

const HighlightedResponse = ({ markdown}) => {

  return (
    <ReactMarkdown
            children={markdown}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={customComponents}
    />
  );
};

export default HighlightedResponse;