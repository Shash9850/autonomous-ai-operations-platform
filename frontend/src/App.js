import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  FiPaperclip,
  FiSend,
  FiTrash2,
  FiEdit2,
  FiSearch,
  FiStar,
  FiDownload,
  FiLogOut,
  FiMic,
  FiMicOff,
  FiVolume2
} from "react-icons/fi";

function App() {

  const [task, setTask] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [streamLogs, setStreamLogs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const [isAuthenticated, setIsAuthenticated] =
    useState(false);

  const [authMode, setAuthMode] =
    useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [chatSessions, setChatSessions] =
    useState([]);

  const [currentChatId, setcurrentChatId] =
    useState(null);

  const [editingChatId, setEditingChatId] =
    useState(null);

  const [editedTitle, setEditedTitle] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const bottomRef = useRef(null);

const abortControllerRef = useRef(null);

  const activeChat =
  chatSessions.find(
    chat => chat.id === currentChatId
  ) || {
      messages: []
    };

    const [isListening, setIsListening] =
    useState(false);

    const [voiceEnabled, setVoiceEnabled] =
    useState(true);

    const [isSpeaking, setIsSpeaking] =
    useState(false);

     const [token, setToken] = useState(
    localStorage.getItem("token")
  );

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`
      }
    : {};

  const filteredChats = chatSessions
    .filter(chat =>
      chat.title
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
    )
    .sort((a, b) => {

      if (a.pinned && !b.pinned) return -1;

      if (!a.pinned && b.pinned) return 1;

      return 0;

    });


    const stopGeneration = () => {

  if (abortControllerRef.current) {

    abortControllerRef.current.abort();

    abortControllerRef.current = null;

  }

  speechSynthesis.cancel();

  setLoading(false);

  setIsSpeaking(false);

};
  const updateActiveChatMessages = (
  newMessages,
  targetChatId = currentChatId
) => {

  setChatSessions(prev =>

    prev.map(chat =>

      chat.id === targetChatId
          ? {
              ...chat,
              messages:
                typeof newMessages === "function"
                  ? newMessages(chat.messages)
                  : newMessages
            }
          : chat

      )

    );

  };

  const exportChat = (chat) => {

    const content = chat.messages
      .map(msg =>
        `${msg.role.toUpperCase()}:\n${msg.content}\n`
      )
      .join("\n-------------------\n\n");

    const blob = new Blob(
      [content],
      { type: "text/plain" }
    );

    const url =
      window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download =
      `${chat.title || "chat"}.txt`;

    a.click();

    window.URL.revokeObjectURL(url);

  };

  const handleAuth = async () => {

    setLoading(true);

    try {

      const endpoint =
        authMode === "login"
          ? "login"
          : "signup";

      const response = await axios.post(
        `http://127.0.0.1:8000/${endpoint}`,
        {
          email,
          password
        }
      );

      if (response.data.token) {

        localStorage.setItem(
          "token",
          response.data.token
        );
        setToken(response.data.token);
       
        setIsAuthenticated(true);
        setLoading(false);

      } else {

        alert(
          response.data.error ||
          "Authentication failed"
        );

      }

   } catch (error) {

  if (error.name !== "AbortError") {

    console.error(error);

  }

} finally {

  setLoading(false);

}

  };

  const loadChats = async () => {

    if (!token) return;

    try {


      const response = await axios.get(
        "http://127.0.0.1:8000/chats",
        {
          headers: authHeaders
        }
      );

      setChatSessions(response.data);

if (
  response.data &&
  response.data.length > 0
) {

  setcurrentChatId(
    response.data[0].id
  );

} else {

  await createNewChat();

}

    } catch (error) {

      console.error(error);

    }

  };

  const createNewChat = async () => {
    if (!token) return;

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/chats",
        {
          title: "AI Conversation",
          pinned: false
        },
        {
          headers:{ Authorization:
        `Bearer ${token}`
}
        }
      );

      const newChat = {
        id: response.data.id,
        title: "AI Conversation",
        messages: [],
        pinned: false
      };

      setChatSessions(prev => [
        newChat,
        ...prev
      ]);

      setcurrentChatId(newChat.id);

    } catch (error) {

      console.error(error);

    }

  };

 const deleteChat = async (chatId) => {

  try {

    await axios.delete(
      `http://127.0.0.1:8000/chats/${chatId}`,
      {
        headers: authHeaders
      }
    );

  } catch (error) {

    console.error(error);

  }

  const updatedChats =
    chatSessions.filter(
      c => c.id !== chatId
    );

  setChatSessions(updatedChats);

  if (updatedChats.length > 0) {

    if (currentChatId === chatId) {

      setcurrentChatId(
        updatedChats[0].id
      );

    }

  } else {

    await createNewChat();

  }

};

  const renameChat = async (

    
  chatId,
  newTitle
) => {

  try {

    await axios.put(
      `http://127.0.0.1:8000/chats/${chatId}`,
      {
        title: newTitle
      },
      {
        headers: authHeaders
      }
    );

  } catch (error) {

    console.error(error);

  }

};


const togglePin = async (chat) => {

  const updatedPinned =
    !chat.pinned;

  setChatSessions(prev =>

    prev.map(c =>

      c.id === chat.id
        ? {
            ...c,
            pinned: updatedPinned
          }
        : c

    )

  );

  try {

    await axios.put(
      `http://127.0.0.1:8000/chats/${chat.id}`,
      {
        pinned: updatedPinned
      },
      {
        headers: authHeaders
      }
    );

  } catch (error) {

    console.error(error);

  }

};


const SpeechRecognition =
  window.SpeechRecognition ||
  window.webkitSpeechRecognition;

 useEffect(() => {

  if (!SpeechRecognition) {

    alert(
      "Speech Recognition not supported in this browser"
    );

  }

}, []);

const recognitionRef = useRef(null);

useEffect(() => {

  recognitionRef.current =
    new SpeechRecognition();

  recognitionRef.current.continuous = false;

  recognitionRef.current.interimResults = false;

  recognitionRef.current.lang = "en-US";

}, []);


const startListening = () => {

  if (isListening) return;

  setIsListening(true);

  try {

    recognitionRef.current.start();

  } catch (error) {

    console.error(error);

    setIsListening(false);

  }

  recognitionRef.current.onresult = (event) => {

    const transcript =
      event.results[0][0].transcript;

    setTask(transcript);

    setIsListening(false);

  };

  recognitionRef.current.onerror = () => {

    setIsListening(false);

  };

  recognitionRef.current.onend = () => {

    setIsListening(false);

  };

};

  const streamTask = async () => {

  if (!task.trim() || loading || !token) return;

   let chatId = currentChatId;

if (!chatId) {

  const response = await axios.post(
    "http://127.0.0.1:8000/chats",
    {
      title: "AI Conversation",
      pinned: false
    },
    {
      headers: authHeaders
    }
  );

  const newChat = {
    id: response.data.id,
    title: "AI Conversation",
    messages: [],
    pinned: false
  };

  setChatSessions(prev => [
    newChat,
    ...prev
  ]);

  setcurrentChatId(newChat.id);

chatId = newChat.id;
}

    

    setLoading(true);

    setStreamLogs([]);

    const updatedMessages = [
      ...(activeChat?.messages || []),
      {
        role: "user",
        content: task
      }
    ];

    updateActiveChatMessages(
  updatedMessages,
  chatId
);



    const generatedTitle =

  task.length > 45
    ? task.slice(0, 45) + "..."
    : task;

setChatSessions(prev =>

  prev.map(chat =>

    chat.id === chatId &&
    (
      chat.title === "New Chat" ||
      chat.title.trim() === ""
    )

      ? {
          ...chat,
          title: generatedTitle
        }

      : chat

  )

);

try {

  await axios.put(

    `http://127.0.0.1:8000/chats/${chatId}`,

    {
      title: generatedTitle
    },

    {
      headers: authHeaders
    }

  );

} catch (error) {

  if (error.name !== "AbortError") {

  console.error(error);

}

}



    try {

      await axios.post(
        `http://127.0.0.1:8000/chats/${chatId}/messages`,
        {
          role: "user",
          content: task
        },
        {
          headers: authHeaders
        }
      );

    } catch (error) {

      console.error(error);

    }

    try {

        abortControllerRef.current =
  new AbortController();
      const response = await fetch(
        "http://127.0.0.1:8000/stream-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${token}`
          },

          signal:
  abortControllerRef.current.signal,
          body: JSON.stringify({
            task: task,
            chat_history: updatedMessages
          })
        }
      );

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder();

      const assistantMessageId = Date.now();

updateActiveChatMessages(prev => [

  ...prev,

  {
    id: assistantMessageId,
    role: "assistant",
    content: ""
  }

], chatId);

      let streamedContent = "";

      while (true) {

        const { done, value } =
          await reader.read();

        if (done) break;

        const chunk =
          decoder.decode(value);

        const lines = chunk
          .split("\n")
          .filter(line =>
            line.startsWith("data:")
          );

        for (const line of lines) {

          const message =
            line.replace("data:", "").trim();

          if (message === "TASK_COMPLETE") {

  setLoading(false);

  setTask("");

  try {

    await axios.post(
      `http://127.0.0.1:8000/chats/${chatId}/messages`,
      {
        role: "assistant",
        content: streamedContent
      },
      {
        headers: authHeaders
      }
    );

  } catch (error) {

    console.error(error);

  }

  if (voiceEnabled && streamedContent) {

    speechSynthesis.cancel();

    const utterance =
  new SpeechSynthesisUtterance(
    streamedContent
  );

utterance.rate = 1;

utterance.pitch = 1;

utterance.lang = "en-US";

utterance.onstart = () => {

  setIsSpeaking(true);

};

utterance.onend = () => {

  setIsSpeaking(false);

};

utterance.onerror = () => {

  setIsSpeaking(false);

};

speechSynthesis.speak(utterance);

  }

  return;

}

          try {

            const parsed =
              JSON.parse(message);
              if (parsed.token) {

  streamedContent += parsed.token;

  updateActiveChatMessages(prev =>

    prev.map(msg =>

      msg.id === assistantMessageId

        ? {
            ...msg,
            content: streamedContent
          }

        : msg

    )

  , chatId);

}

            setResponse(parsed);

  




}

  catch {

            setStreamLogs(prev => [

  ...prev.slice(-20),

  message

]);

          }

        }

      }

    } catch (error) {

  if (error.name !== "AbortError") {

    console.error(error);

  }

} finally {

  setLoading(false);

}

  };

  useEffect(() => {

  setIsAuthenticated(!!token);

}, [token]);

 useEffect(() => {

  if (isAuthenticated && token) {

    loadChats();

  }

}, [isAuthenticated, token]);

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [activeChat?.messages, streamLogs]);

  if (!isAuthenticated) {

    return (

      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">

        <div className="bg-slate-800 p-10 rounded-3xl w-full max-w-md shadow-2xl">

          <h1 className="text-4xl font-bold mb-8 text-center">

            {authMode === "login"
              ? "Login"
              : "Create Account"}

          </h1>

          <div className="space-y-5">

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="w-full p-4 rounded-xl bg-slate-700 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full p-4 rounded-xl bg-slate-700 outline-none"
            />

            <button
  disabled={loading}
  onClick={handleAuth}
              className={`w-full p-4 rounded-xl transition ${
  loading
    ? "bg-slate-600"
    : "bg-blue-600 hover:bg-blue-500"
}`}
            >

             { loading
  ? "Please wait..."
  : authMode === "login"
    ? "Login"
    : "Sign Up"}

            </button>

            <button
              onClick={() =>
                setAuthMode(
                  authMode === "login"
                    ? "signup"
                    : "login"
                )
              }
              className="w-full text-slate-400 hover:text-white transition"
            >

              {authMode === "login"
                ? "Create new account"
                : "Already have an account?"}

            </button>

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-slate-900 text-white">

      <div className="flex h-screen">

        <div className="w-72 bg-slate-950 border-r border-slate-800 p-4 overflow-y-auto">

          <button
           onClick={() => {

  localStorage.removeItem("token");
  setToken(null);
  localStorage.removeItem("chatSessions");
  localStorage.removeItem("activeChatId");

  setChatSessions([]);

  setcurrentChatId(null);

  setResponse(null);

  setStreamLogs([]);

  setSelectedFile(null);

  setTask("");

  setIsAuthenticated(false);

}}
            className="w-full bg-red-600 p-3 rounded-xl mb-4 hover:bg-red-500 transition flex items-center justify-center gap-2"
          >

            <FiLogOut />
            Logout

          </button>

          <button

  onClick={() => {

  if (voiceEnabled) {

    speechSynthesis.cancel();

  }

  setVoiceEnabled(!voiceEnabled);

}}

  className={`w-full p-3 rounded-xl mb-4 transition flex items-center justify-center gap-2 ${
    voiceEnabled
      ? "bg-green-600 hover:bg-green-500"
      : "bg-slate-700 hover:bg-slate-600"
  }`}
>

  <FiVolume2 />

  {voiceEnabled
    ? "Voice ON"
    : "Voice OFF"}

</button>

          <button
            onClick={createNewChat}
            className="w-full bg-blue-600 p-3 rounded-xl mb-6 hover:bg-blue-500 transition"
          >

            + New Chat

          </button>

          <div className="relative mb-4">

            <FiSearch
              className="absolute left-3 top-3 text-slate-400"
              size={18}
            />

            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              className="w-full bg-slate-800 text-white pl-10 pr-4 py-3 rounded-xl outline-none"
            />

          </div>

          <div className="space-y-3">

            {filteredChats.map(chat => (

              <div
                key={chat.id}
                className={`p-3 rounded-xl transition flex items-center justify-between ${
                  currentChatId === chat.id
                    ? "bg-slate-700"
                    : "bg-slate-800 hover:bg-slate-700"
                }`}
              >

                <div className="flex items-center flex-1 gap-2">

                  {editingChatId === chat.id ? (

                    <input
                      value={editedTitle}
                      autoFocus
                      onKeyDown={(e) => {

                      if (e.key === "Enter") {

                       e.target.blur();

                  }

          }}
                      onChange={(e) =>
                        setEditedTitle(e.target.value)
                      }
                      onBlur={() => {

                        setChatSessions(prev =>

                          prev.map(c =>

                            c.id === chat.id
                              ? {
                                  ...c,
                                  title:
                                  editedTitle.trim() ||
                                  "Untitled Chat"
                                }
                              : c

                          )

                        );

                        renameChat(
  chat.id,
  editedTitle.trim() || "Untitled Chat"

  
);

setEditingChatId(null);

                      }}
                      className="bg-slate-700 text-white px-2 py-1 rounded w-full outline-none"
                    />

                  ) : (

                    <span
                      className="cursor-pointer flex-1"
                      onClick={() =>
                        setcurrentChatId(chat.id)
                      }
                    >

                      {chat.title}

                    </span>

                  )}

                </div>

                <div className="flex items-center ml-2">

                  <button
                    onClick={() =>
                      exportChat(chat)
                    }
                    className="text-slate-400 hover:text-green-400 transition mr-2"
                  >

                    <FiDownload size={16} />

                  </button>

                  <button
  onClick={() => togglePin(chat)}
  className={`transition mr-2 ${
    chat.pinned
      ? "text-yellow-400"
      : "text-slate-400 hover:text-yellow-400"
  }`}
>

  <FiStar size={16} />

</button>

                  <button
                    onClick={() => {

                      setEditingChatId(chat.id);

                      setEditedTitle(chat.title);

                    }}
                    className="text-slate-400 hover:text-blue-400 transition mr-2"
                  >

                    <FiEdit2 size={16} />

                  </button>

                  <button
                    onClick={() =>
                      deleteChat(chat.id)
                    }
                    className="text-slate-400 hover:text-red-400 transition"
                  >

                    <FiTrash2 size={16} />

                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

        <div className="flex-1 overflow-y-auto p-8 pb-40">

          <div className="max-w-5xl mx-auto">

            <h1 className="text-5xl font-bold mb-10">
              Autonomous Business Agent
            </h1>

            {loading && (

              <div className="mt-6 bg-slate-800 p-4 rounded-xl animate-pulse">
                Running AI agents...
              </div>

            )}

            {streamLogs.length > 0 && (

              <div className="mt-8 bg-slate-800 p-6 rounded-2xl">

                <h2 className="text-2xl font-semibold mb-4">
                  Live Agent Execution
                </h2>

                <div className="space-y-3">

                  {streamLogs.map((log, index) => (

                    <div
                      key={index}
                      className="bg-slate-700 p-3 rounded-xl"
                    >

                      {log}

                    </div>

                  ))}

                </div>

              </div>

            )}

            <div className="mt-8 space-y-6">

              {activeChat?.messages?.length === 0 && (

  <div className="text-center text-slate-500 mt-32">

    <h2 className="text-3xl font-semibold mb-4">
      Start a conversation
    </h2>

    <p>
      Upload files, analyze datasets,
      generate reports, or ask AI anything.
    </p>

  </div>

)}

              {activeChat?.messages?.map((msg, index) => (

                <div
                  key={msg.id || index}
                  className={`p-5 rounded-2xl max-w-4xl ${
                    msg.role === "user"
                      ? "bg-blue-600 ml-auto"
                      : "bg-slate-800"
                  }`}
                >

                  <p className="text-sm opacity-70 mb-3">

                    {msg.role === "user"
                      ? "You"
                      : "AI Assistant"}

                  </p>

                  <div className="prose prose-invert max-w-none">

                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{

                        code({
                          inline,
                          className,
                          children,
                          ...props
                        }) {

                          const match =
                            /language-(\w+)/.exec(
                              className || ""
                            );

                          return !inline && match ? (

                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >

                              {String(children).replace(/\n$/, "")}

                            </SyntaxHighlighter>

                          ) : (

                            <code
                              className="bg-slate-700 px-2 py-1 rounded"
                              {...props}
                            >

                              {children}

                            </code>

                          );

                        }

                      }}
                    >

                      {msg.content}

                    </ReactMarkdown>

                  </div>

                </div>

              ))}

            </div>

            {response?.chart_path && (

              <div className="mt-8 bg-slate-800 p-6 rounded-2xl">

                <h2 className="text-2xl font-semibold mb-4">
                  Generated Chart
                </h2>

                <img
                  src={`http://127.0.0.1:8000/${response.chart_path}`}
                  alt="Generated Chart"
                  className="rounded-2xl border border-slate-700 shadow-lg w-full max-w-4xl"
                />

              </div>

            )}

            {response?.report_path && (

              <div className="mt-6">

                <a
                  href={`http://127.0.0.1:8000/${response.report_path}`}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-purple-600 px-6 py-3 rounded-xl inline-block hover:bg-purple-500 transition"
                >

                  Download AI Report

                </a>

              </div>

            )}

            <div ref={bottomRef}></div>

          </div>

        </div>

      </div>

      <div className="fixed bottom-0 left-0 w-full bg-slate-900 border-t border-slate-700 p-4">

        <div className="max-w-5xl mx-auto flex items-center gap-4">

          <label className="cursor-pointer text-2xl text-slate-300 hover:text-white transition">

            <FiPaperclip />

            <input
              type="file"
              accept=".pdf,.doc,.docx,.csv,.xlsx"
              className="hidden"
              onChange={async (e) => {

                const file =
                  e.target.files[0];

                if (!file) return;

                setSelectedFile(file);

                const formData =
                  new FormData();

                formData.append(
                  "file",
                  file
                );

                try {

                  const response =
                    await axios.post(
                      "http://127.0.0.1:8000/upload-document",
                      formData,
                      {
                        headers: {
                           "Content-Type":
      "multipart/form-data",
    Authorization:
  token ? `Bearer ${token}` : ""
                        }
                      }
                    );

                  alert(response.data.message);

                } catch (error) {

                  console.error(error);

                  alert("Upload failed");

                }

              }}
            />

          </label>

          <input
            type="text"
            placeholder="Ask anything..."
            value={task}
            onChange={(e) =>
              setTask(e.target.value)
            }
            onKeyDown={(e) => {

              if (e.key === "Enter") {

                streamTask();

              }

            }}
            className="flex-1 p-4 rounded-2xl bg-slate-800 outline-none border border-slate-700"
          />


<div className="flex items-center gap-3">

  <button
    disabled={isListening}
    onClick={startListening}
    className={`p-4 rounded-2xl transition ${
      isListening
        ? "bg-red-600"
        : "bg-slate-700 hover:bg-slate-600"
    }`}
  >

    {isListening
      ? <FiMicOff size={20} />
      : <FiMic size={20} />}

  </button>

  {(loading || isSpeaking) && (

  <button

    onClick={stopGeneration}

    className="bg-red-600 p-4 rounded-2xl hover:bg-red-500 transition"
  >

    Stop

  </button>

)}

</div>

          {!loading && (

<button
  onClick={streamTask}
            className="bg-blue-600 p-4 rounded-2xl hover:bg-blue-500 transition"
          >

            <FiSend size={20} />

          </button>

)}

        </div>

      </div>

    </div>

  );

}

export default App;