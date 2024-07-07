const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { Configuration, OpenAIApi } = require('openai');

// Initialize Express app
const app = express();
const port = 3000;

// API Key hardcoded (not recommended for production!)
const openaiApiKey = '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';

// Configure file storage with multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Initialize OpenAI API with hardcoded key
const configuration = new Configuration({
  apiKey: openaiApiKey,
});
const openai = new OpenAIApi(configuration);

// Endpoint to handle PDF upload
app.post('/upload', upload.single('pdfFile'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    // Parse the PDF file
    const data = await pdfParse(req.file.buffer);
    const textToSummarize = data.text;

    // Call OpenAI API to summarize the text
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Summarize the following text:\n\n${textToSummarize}`,
      max_tokens: 150,
    });

    // Send the summarized text back to the client
    res.send(`
      <h1>Summary of Uploaded PDF</h1>
      <p>${response.data.choices[0].text.trim()}</p>
      <a href="/">Upload another PDF</a>
    `);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Failed to process the PDF.');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
