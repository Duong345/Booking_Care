import axios from '../axios';

export interface IChatResponse {
  answer?: string;
  error?: string;
  message?: string;
}

export interface IUploadResponse {
  status?: string;
  added?: number;
  total?: number;
  error?: string;
  message?: string;
}

export interface IStatusResponse {
  ok?: boolean;
  vectorStoreSize?: number;
  error?: string;
}

const chatbotService = {
  postChat(question: string): Promise<IChatResponse> {
    return axios.post('/chat', { question }) as Promise<IChatResponse>;
  },

  postUploadText(text: string, source = 'widget'): Promise<IUploadResponse> {
    return axios.post('/upload-text', {
      text,
      source,
    }) as Promise<IUploadResponse>;
  },

  postUploadJson(json: string): Promise<IUploadResponse> {
    return axios.post('/upload-json', { json }) as Promise<IUploadResponse>;
  },

  getStatus(): Promise<IStatusResponse> {
    return axios.get('/status') as Promise<IStatusResponse>;
  },
};

export const { postChat, postUploadText, postUploadJson, getStatus } =
  chatbotService;
export default chatbotService;
