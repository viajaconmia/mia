import React, { createContext, useContext, useEffect, useReducer } from "react";

type FunctionCall = {
  status: "success" | "loading" | "error" | "queue";
  tarea: string;
  assistant: string;
  args: any;
  id: string;
  resolucion?: string;
};

export type MessageChat = {
  role: "user" | "assistant";
  text: string;
};

export type ItemStack = {
  role: "assistant";
  functionCall: FunctionCall;
};

export type ItemHistory = MessageChat | ItemStack;

interface ChatState {
  stack: ItemStack[];
  isLoading: boolean;
  thread: string | null;
  history: ItemHistory[];
  messages: MessageChat[];
  booking: { nombre: string } | null;
  input: string;
}

type ChatAction =
  | { type: "SET_STACK"; payload: ItemStack[] } // DONE
  | { type: "SET_LOADING"; payload: boolean } //DONE
  | { type: "SET_INPUT"; payload: string } //DONE
  | { type: "SET_THREAD"; payload: string } // DONE
  | { type: "SET_MESSAGES"; payload: MessageChat[] } //DONE
  | { type: "SET_HISTORY"; payload: ItemHistory[] } //DONE
  | { type: "SET_BOOKING"; payload: { nombre: string } }; //DONE

const initialChatState: ChatState = {
  isLoading: false,
  history: [],
  stack: [],
  thread: null,
  booking: null,
  messages: [],
  input: "",
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case "SET_STACK":
      return { ...state, stack: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_INPUT":
      return { ...state, input: action.payload };
    case "SET_THREAD":
      return { ...state, thread: action.payload };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "SET_HISTORY":
      return { ...state, history: action.payload };
    case "SET_BOOKING":
      return { ...state, booking: action.payload };
    default:
      return state;
  }
};

type ChatContextType = {
  state: ChatState;
  dispatcher: React.Dispatch<ChatAction>;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatcher] = useReducer(chatReducer, initialChatState);

  useEffect(() => {
    console.log(state);
  }, [state]);

  return (
    <ChatContext.Provider value={{ dispatcher, state }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
