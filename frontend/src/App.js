import { useState } from "react";
import axios from "axios";

function App() {

  const [task, setTask] = useState("");

  const [response, setResponse] = useState(null);

  const [loading, setLoading] = useState(false);

  const [streamLogs, setStreamLogs] = useState([]);

  const [selectedFile, setSelectedFile] = useState(null);

  const runTask = async () => {

    setLoading(true);

    try {

      const res = await axios.post(
        "http://127.0.0.1:8000/run-task",
        {
          task: task
        }
      );

      setResponse(res.data);

    } catch (error) {

      console.error(error);

    }

    setLoading(false);
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

  setLoading(true);

  setStreamLogs([]);

  const response = await fetch(
    "http://127.0.0.1:8000/stream-task",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: task
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

    lines.forEach(line => {

      const message = line.replace("data:", "").trim();

      if (message === "TASK_COMPLETE") {
        setLoading(false);
        return;
      }

      try {

        const parsed = JSON.parse(message);

        setResponse(parsed);

      } catch {

        setStreamLogs(prev => [...prev, message]);

      }

    });

  }

};

  return (

    <div className="min-h-screen bg-slate-900 text-white p-8">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-5xl font-bold mb-10">
          Autonomous Business Agent
        </h1>

        <div className="bg-slate-800 p-6 rounded-2xl shadow-lg">

          <div className="flex flex-col gap-4">

  <div className="flex gap-4">

    <input
      type="text"
      placeholder="Enter task..."
      value={task}
      onChange={(e) => setTask(e.target.value)}
      className="flex-1 p-4 rounded-xl bg-slate-700 outline-none"
    />

    <button
      onClick={streamTask}
      className="bg-blue-600 px-6 py-4 rounded-xl hover:bg-blue-500 transition"
    >
      Run Task
    </button>

  </div>

  <div className="flex gap-4">

    <input
      type="file"
      accept=".pdf"
      onChange={(e) => setSelectedFile(e.target.files[0])}
      className="bg-slate-700 p-3 rounded-xl"
    />

    <button
      onClick={uploadDocument}
      className="bg-green-600 px-6 py-3 rounded-xl hover:bg-green-500 transition"
    >
      Upload PDF
    </button>

  </div>

</div>

        </div>

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


        {response && (

          <div className="mt-8 space-y-6">

            <div className="bg-slate-800 p-6 rounded-2xl">

              <h2 className="text-2xl font-semibold mb-4">
                Route
              </h2>

              <p className="text-blue-400 capitalize">
                {response.route}
              </p>

            </div>

            <div className="bg-slate-800 p-6 rounded-2xl">

              <h2 className="text-2xl font-semibold mb-4">
                Execution Plan
              </h2>

              <ul className="space-y-3">

                {response.plan.map((step, index) => (

                  <li
                    key={index}
                    className="bg-slate-700 p-3 rounded-xl"
                  >
                    {index + 1}. {step}
                  </li>

                ))}

              </ul>

            </div>

            <div className="bg-slate-800 p-6 rounded-2xl max-h-[500px] overflow-y-auto">

              <h2 className="text-2xl font-semibold mb-4">
                Final Response
              </h2>

              <p className="whitespace-pre-wrap leading-8 text-slate-200">
                {response.final_response}
              </p>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}







export default App;