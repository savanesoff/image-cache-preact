import devtoolsFPS from "devtools-fps";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImageBucket, ImageComponent, Img, useBucket } from "./../src/";
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
  const [id, setID] = useState(1);

  const [buckets, setBuckets] = useState([
    { blit, load, locked, count, name: "Bucket: " + id },
  ]);

  return (
    <>
      <div>
        <div
          style={{
            gridGap: "10px",
            padding: "10px",
            color: "white",
            backgroundColor: "gray",
          }}
        >
          <legend>New Bucket settings</legend>
          <fieldset
            style={{
              display: "flex",
              flexDirection: "row",
              alignContent: "stretch",
              justifyContent: "start",
              gridGap: "10px",
              border: "none",
              backgroundColor: "black",
            }}
          >
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
              onClick={() => {
                setID(id + 1);
                setBuckets([
                  ...buckets,
                  { blit, load, locked, count, name: `Bucket: ${id + 1}` },
                ]);
              }}
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
              onDelete={(name) => {
                setBuckets(buckets.filter((bucket) => bucket.name !== name));
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function Bucket({
  name,
  locked = true,
  blit = true,
  load = true,
  count = 3,
  onDelete,
}: {
  name: string;
  locked?: boolean;
  blit?: boolean;
  load?: boolean;
  count?: number;
  onDelete: (name: string) => void;
}): JSX.Element {
  const urls = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => i + Math.random()).map(
        (i) => `http://localhost:8080/test-4k.jpg?${i}`
      ),
    [count]
  );

  return (
    <ImageBucket
      name={name}
      locked={locked}
      blit={blit}
      load={load}
      urls={urls}
    >
      <ImagePanel name={name} onDelete={onDelete} />
    </ImageBucket>
  );
}

function ImagePanel({
  name,
  onDelete,
}: {
  name: string;
  onDelete: (name: string) => void;
}): JSX.Element {
  const {
    loaded,
    rendered,
    loading,
    images,
    defaultURL,
    loadProgress,
    clear,
    config,
  } = useBucket();

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
      <p>{name}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(2, 1fr)`,
        }}
      >
        <div>Locked: {config.locked.toString()}</div>
        <div>Blit: {config.blit.toString()}</div>
        <div>Load: {config.load.toString()}</div>
        <div>Loaded: {loaded.toString()}</div>
        <div>Loading: {loading.toString()}</div>
        <div>Rendered: {rendered.toString()}</div>
        <div>Loaded: {loaded.toString()}</div>
        <div>Progress: {Math.round(loadProgress * 100)} %</div>
        <button
          onClick={() => onDelete(name)}
          style={{
            alignContent: "center",
          }}
        >
          Delete
        </button>
      </div>
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
