import { TextInputNode } from './TextInputNode';
import { UrlScraperNode } from './UrlScraperNode';
import { FileUploadNode } from './FileUploadNode';
import { TextAINode } from './TextAINode';
import { ImageAINode } from './ImageAINode';
import { TemplateMergeNode } from './TemplateMergeNode';
import { FinalResultNode } from './FinalResultNode';
import { JsonExtractorNode } from './JsonExtractorNode';
import { ToneRewriterNode } from './ToneRewriterNode';
import { ConditionalNode } from './ConditionalNode';
import { NoteNode } from './NoteNode';
import { WebSearchNode } from './WebSearchNode';
import { SplitterNode } from './SplitterNode';
import { WebhookOutputNode } from './WebhookOutputNode';
import { AudioVoiceNode } from './AudioVoiceNode';
import { BatchLoopNode } from './BatchLoopNode';
import { HttpRequestNode } from './HttpRequestNode';
import { StructuredOutputNode } from './StructuredOutputNode';
import { DelayNode } from './DelayNode';
import { TestAssertionNode } from './TestAssertionNode';

export const nodeTypes = {
  textInput: TextInputNode,
  urlScraper: UrlScraperNode,
  fileUpload: FileUploadNode,
  textAI: TextAINode,
  imageAI: ImageAINode,
  templateMerge: TemplateMergeNode,
  finalResult: FinalResultNode,
  jsonExtractor: JsonExtractorNode,
  toneRewriter: ToneRewriterNode,
  conditional: ConditionalNode,
  note: NoteNode,
  webSearch: WebSearchNode,
  splitter: SplitterNode,
  webhookOutput: WebhookOutputNode,
  audioVoice: AudioVoiceNode,
  batchLoop: BatchLoopNode,
  httpRequest: HttpRequestNode,
  structuredOutput: StructuredOutputNode,
  delay: DelayNode,
  testAssertion: TestAssertionNode,
};

export {
  TextInputNode,
  UrlScraperNode,
  FileUploadNode,
  TextAINode,
  ImageAINode,
  TemplateMergeNode,
  FinalResultNode,
  JsonExtractorNode,
  ToneRewriterNode,
  ConditionalNode,
  NoteNode,
  WebSearchNode,
  SplitterNode,
  WebhookOutputNode,
  AudioVoiceNode,
  BatchLoopNode,
  HttpRequestNode,
  StructuredOutputNode,
  DelayNode,
  TestAssertionNode,
};
