import devtoolsFPS from "devtools-fps";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImageBucket, ImageComponent, useBucket } from "./../src/";
import "./App.css";

devtoolsFPS.config({
  bufferSize: window.innerWidth,
  width: window.innerWidth,
  height: 140,
});

function App() {
  const [blit, setBlit] = useState(true);
  const [load, setLoad] = useState(true);
  const [locked, setLocked] = useState(true);
  const [count, setCount] = useState(3);

  const [buckets, setBuckets] = useState([{ blit, load, locked, count }]);

  return (
    <>
      <div>
        <div>
          <legend>New Bucket settings</legend>
          <fieldset>
            <label htmlFor="blit">Blit</label>
            <input
              type="checkbox"
              id="blit"
              checked={blit}
              onChange={(e) => {
                setBlit(e.target.checked);
              }}
            />

            <label htmlFor="load">Load</label>
            <input
              type="checkbox"
              id="load"
              checked={load}
              onChange={(e) => {
                setLoad(e.target.checked);
              }}
            />

            <label htmlFor="locked">Locked</label>
            <input
              type="checkbox"
              id="locked"
              checked={locked}
              onChange={(e) => {
                setLocked(e.target.checked);
              }}
            />

            <label htmlFor="count">Image Count</label>
            <input
              type="number"
              id="count"
              value={count}
              onChange={(e) => {
                setCount(e.target.valueAsNumber);
              }}
            />
            <button
              onClick={() =>
                setBuckets([...buckets, { blit, load, locked, count }])
              }
            >
              Add Bucket
            </button>
          </fieldset>
        </div>

        <div
          className="panel"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            // flexDirection: "row",
            padding: "10px",
            gridGap: "10px",
          }}
        >
          {buckets.map((bucket, i) => (
            <Bucket
              key={i}
              {...bucket}
              title={`Bucket ${i + 1}`}
              onDelete={() => {
                setBuckets(buckets.filter((_, j) => j !== i));
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function Bucket({
  title,
  locked = true,
  blit = true,
  load = true,
  count = 3,
  onDelete,
}: {
  title: string;
  locked?: boolean;
  blit?: boolean;
  load?: boolean;
  count?: number;
  onDelete: () => void;
}): JSX.Element {
  const urls = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => i + Math.random()).map(
        (i) => `http://localhost:8080/test.jpg?${i}`
      ),
    [count]
  );

  return (
    <ImageBucket
      name={title}
      locked={locked}
      blit={blit}
      load={load}
      urls={urls}
    >
      <ImagePanel title={title} onDelete={onDelete} />
    </ImageBucket>
  );
}

function ImagePanel({
  title,
  onDelete,
}: {
  title: string;
  onDelete: () => void;
}): JSX.Element {
  const { loaded, rendered, loading, images, defaultURL, loadProgress, clear } =
    useBucket();

  const [imageWidth, setImageWidth] = useState(0);

  const ref: { current: HTMLDivElement | null } = useRef(null);

  const collection = useMemo(() => [...images.values()], [images]);
  useEffect(() => {
    if (ref.current) {
      setImageWidth(ref.current.clientWidth / 3);
      // window.addEventListener("resize", () => {
      //   if (!ref.current) return;
      //   setImageWidth(ref.current.clientWidth / 3 - 8);
      // });
    }
    return () => {
      clear();
    };
  }, [clear]);

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: "#353535",
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        alignItems: "start",
        padding: "6px",
      }}
    >
      <p>{title}</p>
      <div>Loaded: {loaded.toString()}</div>
      <div>Loading: {loading.toString()}</div>
      <div>Rendered: {rendered.toString()}</div>
      <div>Progress: {Math.round(loadProgress * 100)} %</div>
      <button
        onClick={onDelete}
        style={{
          alignContent: "center",
        }}
      >
        Delete
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${3}, 1fr)`,
          gridGap: "2px",
        }}
      >
        {collection.map((image, i) => {
          return (
            <ImageComponent
              key={i}
              show={rendered}
              image={image}
              defaultURL={defaultURL}
              width={imageWidth}
              height={imageWidth * 0.75}
            />
          );
        })}
      </div>
    </div>
  );
}

export default App;
