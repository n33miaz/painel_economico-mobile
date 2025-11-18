import axios from "axios";
import { NEWS_API_KEY } from "../../apiConfig";

const newsApi = axios.create({
  baseURL: "https://newsapi.org/v2",
});

newsApi.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params["apiKey"] = NEWS_API_KEY;
  return config;
});

export default newsApi;

export interface NewsArticle {
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: {
    name: string;
  };
}
