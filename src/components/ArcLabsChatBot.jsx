import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpIcon,
  Bot,
  GraduationCap,
  Layers,
  MessageCircle,
  Paperclip,
  Rocket,
  School,
  X,
} from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { getSmartBotAnswer } from "../data/chatbotKnowledge";

const quickPrompts = [
  { label: "School lab setup", icon: School, prompt: "Do you set up AI and Robotics labs for schools?" },
  { label: "Lab package price", icon: GraduationCap, prompt: "What are the school and college lab package prices?" },
  { label: "Compare kits", icon: Layers, prompt: "Compare ARC LABS IoT Lite, Experience, and Pro kits." },
  { label: "CSR proposal", icon: Rocket, prompt: "Can ARC LABS support CSR funded STEM labs with impact reports?" },
  { label: "IIoT solutions", icon: Bot, prompt: "What Industrial IoT and factory automation solutions do you provide?" },
  { label: "Verify cert", icon: GraduationCap, prompt: "How can I verify an ARC LABS certificate?" },
];

function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(
    (reset) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const nextHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight || Infinity)
      );
      textarea.style.height = `${nextHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

function ChatMessage({ message }) {
  return (
    <div className={`arc-chat-message arc-chat-message--${message.role}`}>
      <div className="arc-chat-avatar">
        {message.role === "bot" ? <Bot size={15} /> : "You"}
      </div>
      <div className="arc-chat-bubble">
        <span>{message.text}</span>
        {message.actions?.length > 0 && (
          <div className="arc-chat-answer-actions">
            {message.actions.map((action) =>
              action.to ? (
                <Link key={`${action.label}-${action.to}`} to={action.to}>
                  {action.label}
                </Link>
              ) : (
                <a
                  key={`${action.label}-${action.href}`}
                  href={action.href}
                  target={action.href?.startsWith("http") ? "_blank" : undefined}
                  rel={action.href?.startsWith("http") ? "noreferrer" : undefined}
                >
                  {action.label}
                </a>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArcLabsChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello, welcome to ARC LABS. I am trained on this website's pages, products, lab packages, programs, CSR details, IIoT solutions, certification flow, checkout flow, and contact information. Ask me anything about ARC LABS.",
      actions: [
        { label: "Lab packages", to: "/lab-packages" },
        { label: "Products", to: "/products" },
        { label: "Programs", to: "/programs" },
      ],
    },
  ]);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 46,
    maxHeight: 130,
  });
  const chatBodyRef = useRef(null);

  const suggestions = useMemo(() => quickPrompts, []);

  useEffect(() => {
    if (isOpen && chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  const sendMessage = useCallback(
    (input) => {
      const userText = (input || message).trim();
      if (!userText) return;
      const answer = getSmartBotAnswer(userText);
      setMessages((prev) => [
        ...prev,
        { role: "user", text: userText },
        { role: "bot", text: answer.text, actions: answer.actions || [] },
      ]);
      setMessage("");
      adjustHeight(true);
      setIsOpen(true);
    },
    [adjustHeight, message]
  );

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="arc-chatbot" aria-live="polite">
      {isOpen && (
        <div className="arc-chat-panel">
          <div className="arc-chat-header">
            <div>
              <div className="arc-chat-kicker">ARC LABS AI Assistant</div>
              <h2>How can I help you?</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="arc-chat-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <X size={18} />
            </Button>
          </div>

          <div className="arc-chat-body" ref={chatBodyRef}>
            {messages.map((item, index) => (
              <ChatMessage key={`${item.role}-${index}`} message={item} />
            ))}
          </div>

          <div className="arc-chat-prompts">
            {suggestions.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label} type="button" onClick={() => sendMessage(item.prompt)}>
                  <Icon size={14} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="arc-chat-input-wrap">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                adjustHeight();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about lab setup, kits, pricing, CSR..."
              className="arc-chat-input"
              style={{ overflow: "hidden" }}
            />
            <div className="arc-chat-actions">
              <Button variant="ghost" size="icon" className="arc-chat-attach" aria-label="Attachment placeholder">
                <Paperclip size={16} />
              </Button>
              <Button
                className="arc-chat-send"
                size="icon"
                onClick={() => sendMessage()}
                disabled={!message.trim()}
                aria-label="Send message"
              >
                <ArrowUpIcon size={17} />
              </Button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className="arc-chat-launcher"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close ARC LABS chat" : "Open ARC LABS chat"}
      >
        <MessageCircle size={23} />
        {!isOpen && <span>Ask ARC AI</span>}
      </button>
    </div>
  );
}

