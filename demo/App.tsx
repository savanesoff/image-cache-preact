import devtoolsFPS from "devtools-fps";
import "./App.css";
import { Demo } from "./Demo";

devtoolsFPS.config({
  bufferSize: window.innerWidth,
  width: window.innerWidth,
  height: 140,
});

function App() {
  return (
    <div>
      <div>Image Cache React</div>
      <Demo />
    </div>
  );
}

export default App;
