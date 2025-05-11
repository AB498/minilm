import { pipeline } from "@huggingface/transformers";

async function main() {
  const generateEmbeddings = await pipeline("feature-extraction");
  const embeddings = await generateEmbeddings("Hello, World!");
  console.log(embeddings);
}

main();
module.exports = async (req, res) => {
  try {
    const generateEmbeddings = await pipeline("feature-extraction");
    const embeddings = await generateEmbeddings("Hello, World!");
    res.status(200).json(embeddings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
