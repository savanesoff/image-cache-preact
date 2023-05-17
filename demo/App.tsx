import devtoolsFPS from "devtools-fps";
import { useMemo } from "react";
import { BucketProvider, CacheImage, useBucket } from "./../src/";
import "./App.css";

devtoolsFPS.config({
  bufferSize: 1000,
});

function App() {
  return (
    <>
      <div
        className="panel"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridGap: "10px",
        }}
      >
        <Test title="Panel 1" locked={true} blit={true} load={true} />
        <Test title="Panel 2" locked={true} blit={true} load={true} />
        <Test title="Panel 3" locked={true} blit={true} load={true} />
      </div>
    </>
  );
}

function Test({
  title,
  locked = true,
  blit = true,
  load = true,
}: {
  title: string;
  locked?: boolean;
  blit?: boolean;
  load?: boolean;
}): JSX.Element {
  const images = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => i + Math.random()).map(
        (i) => `http://localhost:8080/test.jpg?${i}`
      ),
    []
  );

  return (
    <BucketProvider locked={locked} blit={blit} load={load} urls={images}>
      <ImagePanel title={title} />
    </BucketProvider>
  );
}

function ImagePanel({ title }: { title: string }): JSX.Element {
  const { loaded, rendered, loading, images, defaultURL, loadProgress } =
    useBucket();

  const collection = useMemo(() => [...images.values()], [images]);

  return (
    <div>
      {title}
      <div>Loaded: {loaded.toString()}</div>
      <div>Loading: {loading.toString()}</div>
      <div>Rendered: {rendered.toString()}</div>
      <div>Progress: {loadProgress}</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridGap: "10px",
        }}
      >
        {rendered &&
          collection.map((image, i) => {
            return (
              <CacheImage
                key={i}
                image={image}
                defaultURL={defaultURL}
                style={{
                  width: "100%",
                }}
              />
            );
          })}
      </div>
    </div>
  );
}

export default App;
