[![by Protosus](https://raw.githubusercontent.com/savanesoff/protosus/main/public/icons/by-protosus.svg)](https://github.com/savanesoff/image-cache-preact)

# image-cache-preact

[![Github](https://badgen.net/badge/Protosus/image-cache-preact?color=purple&icon=github)](https://github.com/savanesoff/image-cache-preact)
[![Demo](https://img.shields.io/badge/Demo-View-brightgreen)](https://savanesoff.github.io/image-cache-preact/)
[![Li](https://badgen.net/badge/Sponsored%20by/Oregan%20Networks?color=blue)](https://oregan.net/)
[![Build Status](https://github.com/savanesoff/image-cache-preact/actions/workflows/publish.yaml/badge.svg?branch=main&event=push)](https://github.com/savanesoff/image-cache-preact/actions/workflows/publish.yaml)
[![NPM](https://img.shields.io/npm/v/image-cache-preact.svg)](https://www.npmjs.com/package/image-cache-preact)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Li](https://badgen.net/badge/savanesoff/LI?color=blue)](https://www.linkedin.com/in/samvel-avanesov)

`Preact` utility for ultimate Web app image (load, pre-load, caching, grouping) control, as well as detailed RAM and GPU memory usage control and monitoring.

[![Validator](https://raw.githubusercontent.com/savanesoff/image-cache-pro/main/demo-assets/image-cache-demo.gif)](https://savanesoff.github.io/image-cache-pro)

You can find a demo of the library [here](https://savanesoff.github.io/image-cache-preact/).

### React Library

[![GitHub Repo](https://img.shields.io/badge/GitHub-image%20cache%20react-blue)](https://github.com/savanesoff/image-cache-react)

[![NPM](https://nodei.co/npm/image-cahce-react.png?mini=true)](https://nodei.co/npm/image-cache-react/)

### VanillaJS Library

[![GitHub Repo](https://img.shields.io/badge/GitHub-image%20cache%20pro-blue)](https://github.com/savanesoff/image-cache-pro)

[![NPM](https://nodei.co/npm/image-cahce-pro.png?mini=true)](https://nodei.co/npm/image-cache-pro/)

## Table of Contents

- [image-cache-preact](#image-cache-preact)
- [React Library](#react-library)
- [VanillaJS Library](#vanillajs-library)
- [Origin](#origin)
- [Use Case](#use-case)
  - [Memory Management](#memory-management)
  - [Performance (FPS)](#performance-fps)
- [Features](#features)
  - [RAM Usage Monitoring](#ram-usage-monitoring)
  - [GPU Memory Usage Monitoring](#gpu-memory-usage-monitoring)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
  - [ControllerProvider](#controllerprovider)
  - [useController](#usecontroller)
  - [BucketProvider](#bucketprovider)
- [Advanced Usage](#advanced-usage)
- [LICENSE](#license)
- [Acknowledgments](#acknowledgments)
- [PS](#ps)

## Origin

We're all too familiar with the concept of client-side caching. We do it all the time when it comes to server data requests to ensure the same requests from your app are cached in JavaScript/Browser to optimize network traffic load and the responsiveness of your application. Everybody wins: the user (no wait time), the cloud (cutting costs of compute), the user's network load, their machine resources, etc. There are lots of libraries addressing this very issue.

But have you ever wondered what happens when your app requests an image from a server? From my research and experience, the browser caches the image data, but we have no access to it, no control over it, we don't know if the image data was evicted from the cache or how much memory was consumed, no way to monitor it, no way to manage it. If the browser decides to evict the image data from the cache, it will be re-requested from the server, which means UI has to wait for the data again, and the whole process repeats itself. This is not good for the user experience, not good for network traffic, not good for the server, not good for the browser, and not good for the user's machine resources.

And this is where this library comes in.

## Use Case

Two main use cases for this library: Memory Usage and Performance (FPS).

### Memory Management

Any web-based application with heavy use of image assets, such as an Image Gallery/Catalog, Product Showcase, or Image Editing, intended to run on a wide range of platforms limited by hardware specifications and/or available resources such as RAM, GPU cache/memory, and CPU. This library provides a way to manage the memory usage of the images loaded by the application and ensure that the application does not consume too much memory and slow down the system while caching images in JS memory and GPU memory.

### Performance (FPS)

Rendering multiple images at once can lead to performance issues (FPS drop). The more images and the higher the image resolution, the bigger the impact. This is because the browser has to push a lot of image data to the GPU memory, and the GPU has to render it on the screen. This library provides a way to pre-render images before they are ready to be displayed on the screen, such that it staggers GPU operations between frames, ensuring that the application runs smoothly and efficiently with minimal FPS drop. Amount of time required for pre-rendering images is determined by the image size and `hardware rank` configuration option. The lower the rank, the slower the pre-rendering process, same goes for larger images takes longer to pre-render. This library does all the heavy lifting for you, so you don't have to worry about it.

## Features

`image-cache-pro` library provides the following features:

- Image pre-loading
- Image pre-rendering
- Image caching
- Image RAM usage monitoring
- Image GPU memory usage monitoring
- Image RAM eviction control
- Image GPU memory eviction control
- Image RAM persistence control
- Image GPU memory persistence control
- Event-driven architecture
- Hardware specifications configuration

### RAM Usage Monitoring

`image-cache-pro` library provides a way to monitor the RAM usage of the images loaded by the application. This is useful to ensure that the application does not consume too much memory and slow down the system.

Image data usage consists of two data footprints:

- **Compressed image data footprint:** Image data as it was received from the server, depending on image type compression (e.g., JPEG, PNG, WEBP, etc.). This is what the browser downloads and stores in RAM as is.
- **Uncompressed image data footprint:** Image data after it has been decompressed by the browser to display its bitmap representation on the screen. An RGB or RGBA bitmap representation of the image (grayscale, color, alpha channel, etc.).

Both of these data are stored in the RAM, and this library provides a way to monitor both of these data footprints to give you a complete picture of the memory usage of the images loaded by the application.

### GPU Memory Usage Monitoring

`image-cache-pro` library provides a way to monitor the GPU memory usage of the images loaded by the application. This is useful to ensure that the application does not consume too much memory and slow down the system. Different browsers handle this bit differently, where most desktop browsers will create bitmap data of the image corresponding to actual pixels rendered on the screen and store it in the GPU memory, while other browsers will store the entire uncompressed image data in the GPU memory and render it on the screen using GPU scaling approach. This distinction is important to understand when it comes to GPU memory usage monitoring and is defined by the `gpuFullMode` configuration option. Where:

- `gpuFullMode: true` - will monitor the entire uncompressed image data footprint in the GPU memory.
- `gpuFullMode: false` - will monitor only the rendered bitmap size data footprint in the GPU memory.

This distinction is important to understand when it comes to GPU memory usage and having an understanding of the actual memory usage of the images loaded by the application. Example:

While rendering a 4k image (RGBA) as 100x100 pixels on the screen, the GPU memory usage will be different depending on the browser, and with the `gpuFullMode` configuration option, we can distinguish a GPU memory footprint:

- In `gpuFullMode: true`, the GPU memory usage will be the same as the uncompressed image data footprint size, which means the GPU memory usage will contain the entire uncompressed image data, which in MB is 3840x2160x4 bytes = 33.18 MB.
  - This is because the entire image data is stored in the GPU memory and rendered on the screen using GPU scaling approach.
- In `gpuFullMode: false`, the GPU memory usage will be the same as the rendered RGBA bitmap size data, which means the GPU memory usage will be the same as the 100x100 RGBA image size, which in MB is 100x100x4 bytes = 0.39 MB.

## Installation

```sh
<npm, pnpm, yarn> install image-cache-preact
```

# Basic Usage

Create a main cache controller instance and configure it with the desired settings.

## ControllerProvider

Use `ControllerProvider` to create cache context. This will create a single instance of the cache controller that will be used by all buckets and requests in your application.

```tsx
import { ControllerProvider } from 'image-cache-preact';

const App = () => {
  return (
    <ControllerProvider
      loaders={6} // number of image loaders to use in parallel
      ram={2000} // max RAM usage for images in "units"
      video={20} // max GPU memory usage for images in "units"
      units="MB" // MB, GB, KB, TB
      hwRank={0.999} // 0-1 where 1 is the highest hardware specification
      gpuDataFull={false}
    >
      <CacheStats />
      {/* you application view*/}
      <ApplicationView />
    </ControllerProvider>
  );
};
```

### useController

Ths hook will help you monitor all `Controller` events and data.

```tsx
import { useController, ControllerEvent } from 'image-cache-preact';

const CacheStats = () => {
  const [imageCount, setImageCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [requestRendered, setRequestRendered] = useState(0);

  const onUpdate = useCallback((event: ControllerEvent<'update'>) => {
    const data = event.target.getRequestsStats();
    setImageCount(event.target.cache.size);
    setRequestCount(data.total);
    setRequestRendered(data.rendered);
  }, []);

  // see useController hook for more options
  useController({
    onUpdate,
    //   onRamOverflow,
    //   onVideoOverflow,
    //   onImageAdded,
    //   onImageRemoved,
    //   onRequestAdded,
    //   onRequestRemoved,
  });

  return (
    <>
      <div>{`Images: ${imageCount}`} </div>
      <div>{`Requests: ${requestCount}`} </div>
      <div>{`Rendered: ${requestRendered} `}</div>
    </>
  );
};
```

## BucketProvider

Then anywhere in your application, create an image `BucketProvider` to handle image groups. Think of Buckets as a way to group images that you want to load, cache, monitor, and control, say for each page or each section of your application.

You can create unlimited buckets, but it's recommended to create a single bucket for each page or section of your view.
Bucket will automatically load and render images in the background, and you can monitor the progress of the images being pre-rendered by listening to events

```tsx
import { BucketProvider } from 'image-cache-preact';
const IMAGE_URLS = [...]; // array of image urls

const PosterGrid =  () => {
    return (
        <BucketProvider>
            {IMAGE_URLS.map((url) => (
                // Use ImageProvider to give your posters context
                <ImageProvider url={url} key={url} width={100} height={160} >
                    <PosterView />
                </ImageProvider>
            ))}
        </BucketProvider>
    )
}
```

Finally render your Posters

```tsx
import { useImage } from 'image-cache-preact';

const PosterView = () => {
  // the image url wil be available as soon as image was processed
  const { visibilityRef, url, width, height } = useImage({
    //   onProgress,
    //   onError,
    //   onLoadend,
    //   onRendered,
    //   onRender,
  });
  return (
    <div
      // assign visibilityRef to the image container to track its visibility for better cache control
      ref={visibilityRef}
    >
      {url ? (
        <img with={width} height={height} src={url} />
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};
```

And thats it!
All done! Now you have a complete control over the images loaded by your application.

# Advanced Usage

Coming soon!

## LICENSE

MIT

## Acknowledgments

Thanks to [Oregan Networks](https://oregan.net/) for sponsoring this project! 🎉🎉🎉

## PS

[![Li](https://badgen.net/badge/Hit%20me%20up%20on/LI?color=blue)](https://www.linkedin.com/in/samvel-avanesov)

Enjoy! 🎉🎉🎉
