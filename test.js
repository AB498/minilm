import { pipeline } from "@huggingface/transformers";

async function main() {
  const generateEmbeddings = await pipeline("feature-extraction");
  const embeddings = await generateEmbeddings("Hello, World!");
  console.log(embeddings);
}

main();