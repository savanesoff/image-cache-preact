import devtoolsFPS from "devtools-fps";
import { Demo } from "./Demo";
import { cn } from "@/utils";

devtoolsFPS.config({
  bufferSize: window.innerWidth,
  width: window.innerWidth,
  height: 140,
});

function App() {
  return (
    <div className={cn("bg-slate-500")}>
      <div>Image Cache React</div>
      <Demo />
    </div>
  );
}

export default App;
