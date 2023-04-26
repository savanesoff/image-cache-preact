import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { BucketProvider } from "./cache/ImageCache";
import { useBucket } from "./cache/useBucket";
import { useEffect } from "react";

const images = Array.from({ length: 10 }, (_, i) => i + 1987).map(
  (i) => `https://images.alphacoders.com/116/1169181.jpg?${i}`
);
function App() {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <BucketProvider locked={false} blit={true} load={true} urls={images}>
          <Test />
        </BucketProvider>
      </div>
    </>
  );
}

function Test(): JSX.Element {
  const { loaded, rendered, loading } = useBucket();

  return (
    <div>
      <div>Loaded: {loaded.toString()}</div>
      <div>Rendered: {rendered.toString()}</div>
      <div>Loading: {loading.toString()}</div>
    </div>
  );
}
export default App;
