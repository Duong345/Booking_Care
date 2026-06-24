import fs from 'fs';
import path from 'path';
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RetrievalQAChain } from '@langchain/classic/chains';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBEDDING_MODEL =
  process.env.OLLAMA_EMBEDDING_MODEL || 'nomic-embed-text:latest';
const GENERATIVE_MODEL =
  process.env.OLLAMA_GENERATIVE_MODEL || 'neural-chat:latest';

const PERSISTED_DATA_FILE = path.resolve(
  __dirname,
  '../../chatbot-persisted.json'
);

console.log('Ollama URL:', OLLAMA_URL);
console.log('Ollama embedding model:', EMBEDDING_MODEL);
console.log('Ollama generative model:', GENERATIVE_MODEL);
console.log('Chatbot persisted data file:', PERSISTED_DATA_FILE);

const embeddings = new OllamaEmbeddings({
  baseUrl: OLLAMA_URL,
  model: EMBEDDING_MODEL,
});

const llm = new ChatOllama({
  baseUrl: OLLAMA_URL,
  model: GENERATIVE_MODEL,
  temperature: 0.7,
});

let vectorStore = null;
let vectorStoreSize = 0;
let persistedItems = [];
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});

const QA_PROMPT = PromptTemplate.fromTemplate(
  `Bạn là một trợ lý thông minh chuyên trả lời bằng tiếng Việt.\n` +
    `Chỉ trả lời dựa trên thông tin có trong phần CONTEXT bên dưới.\n` +
    `Nếu câu hỏi không thể trả lời từ CONTEXT, hãy nói rằng bạn cần thêm dữ liệu.\n\n` +
    `CONTEXT:\n{context}\n\n` +
    `CÂU HỎI:\n{question}\n\n` +
    `TRẢ LỜI:`
);

const parseJsonToText = (value, currentPath = []) => {
  const results = [];

  if (value == null) {
    return results;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      results.push(`${currentPath.join('.') || 'text'}: ${trimmed}`);
    }
    return results;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    results.push(`${currentPath.join('.') || 'value'}: ${value}`);
    return results;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      results.push(...parseJsonToText(item, [...currentPath, String(index)]));
    });
    return results;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      results.push(...parseJsonToText(item, [...currentPath, key]));
    });
    return results;
  }

  return results;
};

const makeDocuments = async (text, source) => {
  const chunks = await textSplitter.splitText(text);
  return chunks.map(
    (chunk, index) =>
      new Document({
        pageContent: chunk,
        metadata: {
          source,
          chunkIndex: index,
        },
      })
  );
};

const loadPersistedData = async () => {
  try {
    if (!fs.existsSync(PERSISTED_DATA_FILE)) {
      return [];
    }
    const content = await fs.promises.readFile(PERSISTED_DATA_FILE, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (error) {
    console.error('Failed to load persisted chatbot data:', error);
    return [];
  }
};

const savePersistedData = async () => {
  try {
    await fs.promises.writeFile(
      PERSISTED_DATA_FILE,
      JSON.stringify(persistedItems, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Failed to save persisted chatbot data:', error);
  }
};

const restoreVectorStore = async () => {
  persistedItems = await loadPersistedData();
  if (persistedItems.length === 0) {
    return;
  }

  const docs = [];
  for (const item of persistedItems) {
    try {
      if (item.uploadMode === 'json') {
        const parsed = JSON.parse(item.payload);
        const texts = parseJsonToText(parsed);
        for (const text of texts) {
          docs.push(...(await makeDocuments(text, item.source)));
        }
      } else {
        docs.push(...(await makeDocuments(item.payload, item.source)));
      }
    } catch (error) {
      console.error('Failed to restore persisted item:', error, item);
    }
  }

  if (docs.length > 0) {
    vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
    vectorStoreSize = docs.length;
  }
};

void restoreVectorStore();

const initChatbotRoute = (app) => {
  app.get('/status', async (req, res) => {
    try {
      const status = await fetch(`${OLLAMA_URL}/api/tags`);
      return res.json({
        ok: status.ok,
        vectorStoreSize,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ ok: false, error: error?.message || 'Backend lỗi' });
    }
  });

  app.post('/upload-text', async (req, res) => {
    const { text, source } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Missing text payload' });
    }

    try {
      const docs = await makeDocuments(text, source || 'upload-text');
      if (!vectorStore) {
        vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
      } else {
        await vectorStore.addDocuments(docs);
      }
      vectorStoreSize += docs.length;
      persistedItems.push({
        uploadMode: 'text',
        payload: text,
        source: source || 'upload-text',
        createdAt: new Date().toISOString(),
      });
      await savePersistedData();

      return res.json({
        status: 'ok',
        added: docs.length,
        total: vectorStoreSize,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('upload-text error:', message, error);
      return res
        .status(500)
        .json({ error: `Failed to upload text: ${message}` });
    }
  });

  app.post('/upload-json', async (req, res) => {
    const { json } = req.body;
    if (!json) {
      return res.status(400).json({ error: 'Missing json payload' });
    }

    try {
      const parsed = typeof json === 'string' ? JSON.parse(json) : json;
      const texts = parseJsonToText(parsed);
      if (texts.length === 0) {
        return res.status(400).json({ error: 'No valid text found in JSON' });
      }

      const docs = (
        await Promise.all(
          texts.map((text, index) => makeDocuments(text, `json-${index}`))
        )
      ).flat();

      if (!vectorStore) {
        vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
      } else {
        await vectorStore.addDocuments(docs);
      }
      vectorStoreSize += docs.length;
      persistedItems.push({
        uploadMode: 'json',
        payload: typeof json === 'string' ? json : JSON.stringify(json),
        source: 'upload-json',
        createdAt: new Date().toISOString(),
      });
      await savePersistedData();

      return res.json({
        status: 'ok',
        added: docs.length,
        total: vectorStoreSize,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('upload-json error:', message, error);
      return res
        .status(500)
        .json({ error: `Failed to parse or upload JSON: ${message}` });
    }
  });

  app.post('/chat', async (req, res) => {
    const { question } = req.body;
    if (!question || typeof question !== 'string') {
      return res
        .status(400)
        .json({ error: 'Missing question in request body' });
    }

    if (!vectorStore) {
      return res
        .status(400)
        .json({ error: 'No vector store available. Upload data first.' });
    }

    try {
      const retriever = vectorStore.asRetriever({
        searchType: 'similarity',
        k: 5,
      });
      const chain = RetrievalQAChain.fromLLM(llm, retriever, {
        prompt: QA_PROMPT,
        returnSourceDocuments: false,
      });
      const response = await chain.call({ query: question });
      return res.json({ answer: response.text ?? response.output_text ?? '' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to generate answer' });
    }
  });
};

export default initChatbotRoute;
