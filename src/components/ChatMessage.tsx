// src/components/ChatMessage.tsx (o donde lo tengas)
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MessageChat } from "../context/ChatContext";
import { useChat } from "../hooks/useChat";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  isLoading?: boolean;
}

export const ChatMessagesController: React.FC<{
  messages: MessageChat[];
}> = ({ messages }) => {
  const { loading } = useChat();
  return (
    <>
      {messages.reverse().map((item, index) => {
        // if (
        //   item.component_type === "user" ||
        //   item.component_type === "message"
        // ) {
        return (
          <ChatMessage
            key={index}
            content={item.text || ""}
            isUser={item.role === "user"}
            isLoading={loading}
          />
        );
        // }
        // if (item.component_type === "hotel") {
        //   return (
        //     <div key={index} className="overflow-x-auto p-4 pt-0">
        //       <div className="flex flex-col md:flex-row gap-3">
        //         {item.id_hoteles.map((hotelId) => (
        //           <div key={hotelId + `${index}`} className="md:min-w-[300px]">
        //             <HotelCard id_hotel={hotelId} />
        //           </div>
        //         ))}
        //       </div>
        //     </div>
        //   );
        // }
        // if (item.component_type === "flight") {
        //   return (
        //     <div key={index} className="p-4 pt-0">
        //       <FlightCard payload={item.payload} />
        //     </div>
        //   );
        // }
        // if (item.component_type === "error") {
        //   return (
        //     <div
        //       key={index}
        //       className="bg-red-600/80 text-white p-4 rounded-xl mx-2 my-2 shadow-md"
        //     >
        //       <p>{item.content}</p>
        //     </div>
        //   );
        // }
        // return null;
      })}
    </>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  content,
  isUser,
}) => {
  return (
    <div
      className={`w-full mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[90%] md:max-w-[70%] px-4 py-3 rounded-2xl backdrop-blur-md border shadow-md transition-all duration-300
        ${
          isUser
            ? "bg-white text-blue-900 rounded-br-none border-blue-100 hover:shadow-lg"
            : "bg-gradient-to-r from-blue-800/90 to-blue-600/90 text-white rounded-bl-none border-white/10 hover:shadow-xl"
        }`}
      >
        <div
          className={`prose prose-sm max-w-none ${
            isUser ? "" : "prose-invert"
          }`}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p
                  className={`mb-1 ${
                    isUser ? "text-blue-700" : "text-blue-50"
                  }`}
                >
                  {children}
                </p>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`underline font-medium ${
                    isUser ? "text-blue-600" : "text-blue-100"
                  }`}
                >
                  {children}
                </a>
              ),
              img: ({ src, alt }) => (
                <img
                  src={src}
                  alt={alt}
                  className="rounded-lg max-w-full h-auto my-2 shadow-sm border border-white/20"
                  loading="lazy"
                />
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="mb-1">
                  <p className={isUser ? "text-blue-700" : "text-blue-50"}>
                    {children}
                  </p>
                </li>
              ),
              h1: ({ children }) => (
                <h1
                  className={`text-xl font-bold mb-2 ${
                    isUser ? "text-blue-700" : "text-white"
                  }`}
                >
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2
                  className={`text-lg font-semibold mb-2 ${
                    isUser ? "text-blue-700" : "text-blue-50"
                  }`}
                >
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3
                  className={`text-base font-semibold mb-1 ${
                    isUser ? "text-blue-700" : "text-blue-50"
                  }`}
                >
                  {children}
                </h3>
              ),
              code: ({ children }) => (
                <code
                  className={`px-1.5 py-0.5 rounded text-xs ${
                    isUser ? "bg-blue-50 text-blue-800" : "bg-white/10"
                  }`}
                >
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre
                  className={`p-3 rounded-lg mb-2 overflow-x-auto text-xs ${
                    isUser ? "bg-blue-50 text-blue-900" : "bg-blue-900/40"
                  }`}
                >
                  {children}
                </pre>
              ),
              table: ({ children }) => (
                <table className="min-w-full text-xs text-white border border-white/20 mb-3 rounded-lg overflow-hidden">
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
                <tr className="border-b border-white/10 last:border-none">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 align-top">{children}</td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
