import 'dotenv/config';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { YoutubeLoader } from 'langchain/document_loaders/web/youtube';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

dotenv.config();

export const openai = new OpenAI();

const question: string = process.argv[2] || 'hi';

const videoUrl: string = 'https://youtu.be/Cml3CFDBj2s?si=YuD3EfBPFd_Mc3eo';
const pdfPath: string = 'gpt-4.pdf';

// Define types for document results
interface Document {
  pageContent: string;
  metadata: { source: string };
}

// Function to create a memory vector store from documents
export const createStore = async (
  docs: Document[]
): Promise<MemoryVectorStore> =>
  await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings());

// Function to load documents from a YouTube video
export const docsFromYTVideo = async (
  videoUrl: string
): Promise<Document[]> => {
  const loader = YoutubeLoader.createFromUrl(videoUrl, {
    language: 'en',
    addVideoInfo: true,
  });

  const documents = await loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: ' ',
      chunkSize: 2500,
      chunkOverlap: 100,
    })
  );

  return documents.map((doc) => ({
    pageContent: doc.pageContent,
    metadata: { source: videoUrl },
  }));
};

// Function to load documents from a PDF file
export const docsFromPDF = async (): Promise<Document[]> => {
  const loader = new PDFLoader(pdfPath);

  const documents = await loader.loadAndSplit(
    new CharacterTextSplitter({
      separator: '. ',
      chunkSize: 2500,
      chunkOverlap: 200,
    })
  );

  return documents.map((doc) => ({
    pageContent: doc.pageContent,
    metadata: { source: pdfPath },
  }));
};

// Function to load the document store from both video and PDF
const loadStore = async (): Promise<MemoryVectorStore> => {
  const videoDocs = await docsFromYTVideo(videoUrl);
  const pdfDocs = await docsFromPDF();

  return createStore([...videoDocs, ...pdfDocs]);
};

// Function to perform a query and get a response from OpenAI
const query = async (): Promise<void> => {
  const store = await loadStore();
  const results = await store.similaritySearch(question, 1);

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k-0613',
    temperature: 0,
    messages: [
      {
        role: 'assistant',
        content:
          'You are a helpful AI assistant. Answer questions to your best ability.',
      },
      {
        role: 'user',
        content: `Answer the following question using the provided context. If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context.
        Question: ${question}

        Context: ${results.map((r) => r.pageContent).join('\n')}`,
      },
    ],
  });

  console.log(
    `Answer: ${response.choices[0].message.content}\n\nSources: ${results
      .map((r) => r.metadata.source)
      .join(', ')}`
  );
};

query();
