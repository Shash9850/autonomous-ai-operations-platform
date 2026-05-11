import { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  FiPaperclip,
  FiSend
} from "react-icons/fi";

function App() {

  const [task, setTask] = useState("");



  const [response, setResponse] = useState(null);

  const [loading, setLoading] = useState(false);

  const [streamLogs, setStreamLogs] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);

  const [recipientEmail, setRecipientEmail] = useState("");

  const bottomRef = useRef(null);

const [chatSessions, setChatSessions] = useState([
  {
    id: 1,
    title: "New Chat",
    messages: []
  }

]);

const [activeChatId, setActiveChatId] = useState(1);

const activeChat = chatSessions.find(
  chat => chat.id === activeChatId
);

const updateActiveChatMessages = (newMessages) => {

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


  const uploadDocument = async () => {

    if (!selectedFile) return;

    const formData = new FormData();

    formData.append("file", selectedFile);

    try {

      const response = await axios.post(
        "http://127.0.0.1:8000/upload-document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.message);

    } catch (error) {

      console.error(error);

      alert("Upload failed");

    }

  };



  const streamTask = async () => {

    if (!task.trim()) return;

    setLoading(true);

    setStreamLogs([]);

    const updatedMessages = [
      ...activeChat.messages,
      {
        role: "user",
        content: task
      }
    ];

    updateActiveChatMessages(updatedMessages);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/stream-task",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            task: task,
            recipient_email: recipientEmail,
            chat_history: updatedMessages
          }),
        }
      );

   

      const reader = response.body.getReader();

      const decoder = new TextDecoder();

      while (true) {

        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);

        const lines = chunk
          .split("\n")
          .filter(line => line.startsWith("data:"));

        for (const line of lines) {

          const message = line.replace("data:", "").trim();

          if (message === "TASK_COMPLETE") {

            setLoading(false);

            setTask("");

            return;
          }

          try {

            const parsed = JSON.parse(message);

            setResponse(parsed);

            if (parsed.final_response) {

              updateActiveChatMessages(prev => [
  ...prev,
  {
    role: "assistant",
    content: ""
  }
]);
             const words = parsed.final_response.split(" ");

let currentText = "";

for (let i = 0; i < words.length; i++) {

  currentText += words[i] + " ";

  await new Promise(resolve =>
    setTimeout(resolve, 20)
  );

  updateActiveChatMessages(prev => {

    const updated = [...prev];

    updated[updated.length - 1] = {
      role: "assistant",
      content: currentText
    };

    return updated;

  });

}

            }

          } catch {

            setStreamLogs(prev => [...prev, message]);

          }

        }

      }

    } catch (error) {

      console.error(error);

      setLoading(false);

    }

  };

useEffect(() => {

  bottomRef.current?.scrollIntoView({
    behavior: "smooth"
  });

}, [activeChat.messages, streamLogs]);

  return (

    <div className="min-h-screen bg-slate-900 text-white p-8 pb-40">

      <div className="flex h-screen">

  <div className="w-72 bg-slate-950 border-r border-slate-800 p-4 overflow-y-auto">

    <button

      onClick={() => {

        const newChat = {
          id: Date.now(),
          title: "New Chat",
          messages: []
        };

        setChatSessions(prev => [
          newChat,
          ...prev
        ]);

        setActiveChatId(newChat.id);

      }}

      className="w-full bg-blue-600 p-3 rounded-xl mb-6 hover:bg-blue-500 transition"
    >

      + New Chat

    </button>

    <div className="space-y-3">

      {chatSessions.map(chat => (

        <div

          key={chat.id}

          onClick={() => setActiveChatId(chat.id)}

          className={`p-3 rounded-xl cursor-pointer transition ${
            activeChatId === chat.id
              ? "bg-slate-700"
              : "bg-slate-800 hover:bg-slate-700"
          }`}
        >

          {chat.title}

        </div>

      ))}

    </div>

  </div>

  <div className="flex-1 overflow-y-auto p-8">

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
                  className="bg-slate-700 p-3 rounded-xl animate-pulse"
                >
                  {log}
                </div>

              ))}

            </div>

          </div>

        )}



        <div className="mt-8 space-y-6">

          {activeChat.messages.map((msg, index) => (

            <div
              key={index}
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

    code({ inline, className, children, ...props }) {

      const match = /language-(\w+)/.exec(className || "");

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

    },

    table({ children }) {

      return (

        <table className="table-auto border-collapse border border-slate-600 w-full my-4">

          {children}

        </table>

      );

    },

    th({ children }) {

      return (

        <th className="border border-slate-600 px-4 py-2 bg-slate-700">

          {children}

        </th>

      );

    },

    td({ children }) {

      return (

        <td className="border border-slate-600 px-4 py-2">

          {children}

        </td>

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

{selectedFile && (

  <div className="mt-4 text-sm text-slate-400">

    Uploaded:
    <span className="ml-2 text-white">
      {selectedFile.name}
    </span>

  </div>

)}

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

      </div>


<div ref={bottomRef}></div>
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

          const file = e.target.files[0];

          if (!file) return;

          setSelectedFile(file);

          const formData = new FormData();

          formData.append("file", file);

          try {

            const response = await axios.post(
              "http://127.0.0.1:8000/upload-document",
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
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

  onKeyDown={(e) => {

    if (e.key === "Enter") {

      streamTask();

    }

  }}
      placeholder="Ask anything..."
      value={task}
      onChange={(e) => setTask(e.target.value)}
      className="flex-1 p-4 rounded-2xl bg-slate-800 outline-none border border-slate-700"
    />


    

    <button
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