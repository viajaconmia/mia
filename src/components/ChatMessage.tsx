import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatContent } from "../types/chat";
import { HotelCard } from "./HotelCard";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  isLoading?: boolean;
}
export const ChatMessagesController: React.FC<{
  messages: ChatContent[];
}> = ({ messages }) => {
  return (
    <>
      {messages.map((item, index) => {
        if (
          item.component_type === "user" ||
          item.component_type === "message"
        ) {
          return (
            <ChatMessage
              key={index}
              content={item.content}
              isUser={item.component_type === "user"}
              isLoading={true}
            />
          );
        }
        if (item.component_type === "hotel") {
          return (
            <div key={index} className="overflow-x-auto p-4 pt-0 ">
              <div className="flex gap-2">
                {item.id_hoteles.map((hotelId) => (
                  <div key={hotelId + `${index}`} className="min-w-[300px]">
                    <HotelCard key={hotelId + `${index}`} id_hotel={hotelId} />
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (item.component_type === "error") {
          return (
            <div
              key={index}
              className="bg-red-600/70 text-white p-4 rounded-lg"
            >
              <p>{item.content}</p>
            </div>
          );
        }
        return null; // Handle other component types if needed
      })}
    </>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
  isLoading,
}) => {
  const [displayContent, setDisplayContent] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isUser && !isLoading) {
      setIsTyping(true);
      setCurrentIndex(0);
      setDisplayContent("");

      const interval = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev < content.length) {
            setDisplayContent((prevContent) => prevContent + content[prev]);
            return prev + 1;
          }
          clearInterval(interval);
          setIsTyping(false);
          return prev;
        });
      }, 10);

      return () => clearInterval(interval);
    } else {
      setDisplayContent(content);
    }
  }, [content, isUser, isLoading]);

  const messageContent = isUser ? content : displayContent;

  return (
    <div
      className={`max-w-[100%] w-fit p-4 rounded-2xl backdrop-blur-lg ${
        isUser
          ? "bg-white text-blue-900 ml-auto rounded-br-none transform transition-all duration-300 hover:shadow-lg opacity-0 animate-fade-in-bottom-right"
          : "text-white transform transition-all duration-300 opacity-0 animate-fade-in-left"
      }`}
    >
      <div
        className={`prose prose-sm max-w-none ${isUser ? "" : "prose-invert"}`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => (
              <p className={`${isUser ? "text-blue-600" : "text-white"}`}>
                {children}
              </p>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`underline ${
                  isUser ? "text-blue-600" : "text-white"
                }`}
              >
                {children}
              </a>
            ),
            img: ({ src, alt }) => (
              <img
                src={src}
                alt={alt}
                className="rounded-lg max-w-full h-auto my-2 shadow-sm"
                loading="lazy"
              />
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-4 mb-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-4 mb-2">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="mb-1">
                <p className="text-white">{children}</p>
              </li>
            ),
            h1: ({ children }) => (
              <h1
                className={`text-xl font-bold mb-2 ${
                  isUser ? "text-blue-600" : "text-white"
                }`}
              >
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2
                className={`text-lg font-bold mb-2 ${
                  isUser ? "text-blue-600" : "text-white"
                }`}
              >
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3
                className={`text-base font-bold mb-2 ${
                  isUser ? "text-blue-600" : "text-white"
                }`}
              >
                {children}
              </h3>
            ),
            code: ({ children }) => (
              <code
                className={`px-1 py-0.5 rounded ${
                  isUser ? "bg-blue-100" : "bg-white/10"
                }`}
              >
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre
                className={`p-3 rounded-lg mb-2 overflow-x-auto ${
                  isUser ? "bg-blue-50" : "bg-white/10"
                }`}
              >
                {children}
              </pre>
            ),
            table: ({ children }) => (
              <table className="min-w-full text-sm text-white border border-white/20 mb-4">
                {children}
              </table>
            ),
            thead: ({ children }) => (
              <thead className="bg-white/10 text-white font-bold">
                {children}
              </thead>
            ),
            tbody: ({ children }) => <tbody>{children}</tbody>,
            tr: ({ children }) => (
              <tr className="border-b border-white/10">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-4 py-2 text-left">{children}</th>
            ),
            td: ({ children }) => <td className="px-4 py-2">{children}</td>,
          }}
        >
          {messageContent}
        </ReactMarkdown>
      </div>
      {isTyping && (
        <div className="flex space-x-1 mt-2">
          <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
        </div>
      )}
    </div>
  );
};
