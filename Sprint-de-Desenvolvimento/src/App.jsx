import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sistema funcionando 🚀</h1>

      <button onClick={() => setCount((c) => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}

export default App;