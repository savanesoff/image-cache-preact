import defaultImage from "../assets/default.png";
export const getHwRank = () => {
  const img = new Image();
  img.onload = startTest;
  img.src = defaultImage; //`http://localhost:8080/test-4k.jpg?hash=${Math.random()}`;
};

const startTest = (event: Event) => {
  const img = event.target as HTMLImageElement;

  const div = document.createElement("div");
  div.appendChild(img);
  div.style.opacity = "0.1";
  div.style.position = "absolute";
  div.style.top = "0";
  div.style.left = "0";
  //   img.style.width = "540px";
  //   img.style.height = "540px";
  const start = performance.now();
  document.body.appendChild(div);

  //    window.requestIdleCallback(() => {
  //      const end = performance.now();
  //      const duration = end - start;
  //      console.log("Approximate render time:", duration);

  //      if (displacedElement.offsetTop === expectedTop) {
  //        console.log("Image appears to be rendered");
  //      } else {
  //        console.log("Image does not appear to be rendered");
  //      }
  //    });

  requestIdleCallback(() => {
    // const bounds = div.getBoundingClientRect();
    const end = performance.now();
    const duration = end - start;
    // console.log("Render time:", duration, bounds.width, bounds.height);
    return duration;
  });
};
