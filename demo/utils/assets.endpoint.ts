import { ImageColorType, MIMEType } from "@/lib";
import config from "@demo/config.json";
import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 3,
    min: 1,
  },
  wordsPerSentence: {
    max: 5,
    min: 2,
  },
});

type FetchAssetsParams = {
  topic: Topic;
  page: number;
  limit?: number;
};
export type Asset = {
  url: string;
  title: string;
  description: string;
  mimeType: MIMEType;
  colorType: ImageColorType;
};

export type AssetPage = {
  page: number;
  assets: Asset[];
};
const cache = new Map<string, AssetPage>();

export const fetchAssets = async ({
  topic,
  page,
}: FetchAssetsParams): Promise<AssetPage> => {
  const key = `${topic.id}-${page}-${topic.perPage}`;
  const data = cache.get(key);

  if (data) {
    return data;
  }

  const newData = new Array(topic.perPage).fill(0).map(() => ({
    url: `${config.image.baseUrl}?hash=${Math.random()}`,
    mimeType: config.image.mimeType as MIMEType,
    colorType: config.image.colorType as ImageColorType,
    title: lorem.generateSentences(1),
    description: lorem.generateParagraphs(1),
  }));

  const newPage = {
    page,
    assets: newData,
  };

  cache.set(key, newPage);

  return newPage;
};

type FetchTopicsParams = {
  count: number;
  perPage?: number;
};
export type Topic = {
  id: string;
  title: string;
  description: string;
  pages: number;
  perPage: number;
};
export const fetchTopics = async ({
  count = 10,
  perPage = 10,
}: FetchTopicsParams): Promise<Topic[]> => {
  return new Array(count).fill(0).map(() => ({
    title: lorem.generateWords(1),
    description: lorem.generateParagraphs(1),
    id: Math.random().toString(36).substring(7),
    pages: 3, //1 + Math.ceil(Math.random() * 20),
    perPage,
  }));
};
