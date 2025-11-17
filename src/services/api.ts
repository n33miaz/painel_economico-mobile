import axios from 'axios';

export interface CurrencyData {
  name: string;
  buy: number;
  sell: number | null;
  variation: number;
}

const api = axios.create({
  baseURL: 'https://economia.awesomeapi.com.br/json',
});

export default api;