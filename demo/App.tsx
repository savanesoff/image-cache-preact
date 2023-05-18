import devtoolsFPS from "devtools-fps";
import { useEffect, useMemo } from "react";
import { BucketProvider, CacheImage, useBucket } from "./../src/";
import "./App.css";

devtoolsFPS.config({
  bufferSize: 1000,
  width: window.innerWidth,
  height: 140,
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
        {/* <Test title="Panel 2" locked={true} blit={true} load={true} />
        <Test title="Panel 3" locked={true} blit={true} load={true} /> */}
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
      Array.from({ length: 12 }, (_, i) => i + Math.random()).map(
        (i) => `http://localhost:8080/test.jpg?${i}`
      ),
    []
  );

  return (
    <BucketProvider
      name={title}
      locked={locked}
      blit={blit}
      load={load}
      urls={images}
    >
      <ImagePanel title={title} />
    </BucketProvider>
  );
}

function ImagePanel({ title }: { title: string }): JSX.Element {
  const { loaded, rendered, loading, images, defaultURL, loadProgress, clear } =
    useBucket();

  const collection = useMemo(() => [...images.values()], [images]);
  useEffect(() => {
    return () => {
      clear();
    };
  }, [clear]);

  return (
    <div>
      {title}
      <div>Loaded: {loaded.toString()}</div>
      <div>Loading: {loading.toString()}</div>
      <div>Rendered: {rendered.toString()}</div>
      <div>Progress: {Math.round(loadProgress * 100)} %</div>
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
                  width: "50px",
                  height: "50px",
                }}
              />
            );
          })}
      </div>
    </div>
  );
}

export default App;
