import express from 'express';
import cors from 'cors';
import { ChatOllama, OllamaEmbeddings } from '@langchain/ollama';
import { Document } from '@langchain/core/documents';
import { PromptTemplate } from '@langchain/core/prompts';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { RetrievalQAChain } from '@langchain/classic/chains';

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const EMBEDDING_MODEL = 'mxbai-embed-large';
const GENERATIVE_MODEL = 'llama3';

const embeddings = new OllamaEmbeddings({
  baseUrl: OLLAMA_URL,
  model: EMBEDDING_MODEL,
});

const llm = new ChatOllama({
  baseUrl: OLLAMA_URL,
  model: GENERATIVE_MODEL,
  temperature: 0.7,
});

let vectorStore: MemoryVectorStore | null = null;
let vectorStoreSize = 0;
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

const parseJsonToText = (value: any, currentPath: string[] = []): string[] => {
  const results: string[] = [];

  if (value == null) {
    return results;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length >= 20) {
      results.push(`${currentPath.join('.') || 'text'}: ${trimmed}`);
    }
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

const makeDocuments = async (
  text: string,
  source: string
): Promise<Document[]> => {
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

app.get('/status', async (req, res) => {
  try {
    const status = await fetch(`${OLLAMA_URL}/api/tags`);
    return res.json({
      ok: status.ok,
      vectorStoreSize,
    });
  } catch (error) {
    return res.status(500).json({ ok: false, error: (error as Error).message });
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

    return res.json({
      status: 'ok',
      added: docs.length,
      total: vectorStoreSize,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to upload text' });
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

    return res.json({
      status: 'ok',
      added: docs.length,
      total: vectorStoreSize,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to parse or upload JSON' });
  }
});

app.post('/chat', async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ error: 'Missing question in request body' });
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

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`LangChain RAG server running on http://localhost:${PORT}`);
});
