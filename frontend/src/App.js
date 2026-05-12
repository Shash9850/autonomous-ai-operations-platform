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
  FiLogOut
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

  const [activeChatId, setActiveChatId] =
    useState(null);

  const [editingChatId, setEditingChatId] =
    useState(null);

  const [editedTitle, setEditedTitle] =
    useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const bottomRef = useRef(null);

  const token =
    localStorage.getItem("token");

  const authHeaders = {
    Authorization: `Bearer ${token}`
  };

  const activeChat =
    chatSessions.find(
      chat => chat.id === activeChatId
    ) || {
      messages: []
    };

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

  const updateActiveChatMessages = (
    newMessages
  ) => {

    setChatSessions(prev =>

      prev.map(chat =>

        chat.id === activeChatId
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

        setIsAuthenticated(true);
        setLoading(false);

      } else {

        alert(
          response.data.error ||
          "Authentication failed"
        );

      }

    } catch (error) {

  console.error(error);

} finally {

  setLoading(false);

}

  };

  const loadChats = async () => {

    try {

      const response = await axios.get(
        "http://127.0.0.1:8000/chats",
        {
          headers: authHeaders
        }
      );

      setChatSessions(response.data);

      if (response.data.length > 0) {

  setActiveChatId(
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

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/chats",
        {
          title: "New Chat",
          pinned: false
        },
        {
          headers: authHeaders
        }
      );

      const newChat = {
        id: response.data.id,
        title: "New Chat",
        messages: [],
        pinned: false
      };

      setChatSessions(prev => [
        newChat,
        ...prev
      ]);

      setActiveChatId(newChat.id);

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

    if (activeChatId === chatId) {

      setActiveChatId(
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

  const streamTask = async () => {

    if (!task.trim() || loading) return;

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
      updatedMessages
    );

    try {

      await axios.post(
        `http://127.0.0.1:8000/chats/${activeChatId}/messages`,
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

      const response = await fetch(
        "http://127.0.0.1:8000/stream-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${token}`
          },
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

            return;

          }

          try {

            const parsed =
              JSON.parse(message);

            setResponse(parsed);

            if (parsed.final_response) {

  const assistantMessageId = Date.now();
  let currentText = "";

updateActiveChatMessages(prev => [

  ...prev,

  {
    id: assistantMessageId,
    role: "assistant",
    content: ""
  }

]);

  const words =
    parsed.final_response.split(" ");

  for (
    let i = 0;
    i < words.length;
    i++
  ) {

    currentText += words[i] + " ";

    await new Promise(resolve =>
      setTimeout(resolve, 15)
    );

   updateActiveChatMessages(prev =>

  prev.map(msg =>

    msg.id === assistantMessageId

      ? {
          ...msg,
          content: currentText
        }

      : msg

  )

);

  }

  try {

  await axios.post(
    `http://127.0.0.1:8000/chats/${activeChatId}/messages`,
    {
      role: "assistant",
      content:
        parsed.final_response
    },
    {
      headers: authHeaders
    }
  );

} catch (error) {

  console.error(error);

}

}

          } catch {

            setStreamLogs(prev => [

  ...prev.slice(-20),

  message

]);

          }

        }

      }

    } catch (error) {

  console.error(error);

} finally {

  setLoading(false);

}

  };

  useEffect(() => {

    const token =
      localStorage.getItem("token");

    if (token) {

      setIsAuthenticated(true);

    }

  }, []);

  useEffect(() => {

    if (isAuthenticated) {

      loadChats();

    }

  }, [isAuthenticated]);

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
  localStorage.removeItem("chatSessions");
  localStorage.removeItem("activeChatId");

  setChatSessions([]);

  setActiveChatId(null);

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
                  activeChatId === chat.id
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
                        setActiveChatId(chat.id)
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
      `Bearer ${token}`
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

          <button
  disabled={loading}
  onClick={streamTask}
            className="bg-blue-600 p-4 rounded-2xl hover:bg-blue-500 transition"
          >

            <FiSend size={20} />

          </button>

        </div>

      </div>

    </div>

  );

}

export default App;