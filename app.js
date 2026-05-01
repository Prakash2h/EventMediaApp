const express = require('express');
const multer = require('multer');
const path = require('path');
const { BlobServiceClient } = require('@azure/storage-blob');

const app = express();
const port = 3000;

// Replace this with your actual Azure Storage connection string
const AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=youraccountname;AccountKey=youraccountkey;EndpointSuffix=core.windows.net";

// Create BlobServiceClient from connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient('media-container');

// Set up Multer for file upload handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Files will be saved in the "uploads" directory temporarily
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique file name with extension
  },
});

const upload = multer({ storage: storage });

// Route to upload media files (photos, videos, etc.)
app.post('/upload', upload.single('media'), async (req, res) => {
  try {
    // Upload the file to Azure Blob Storage
    const blobName = path.basename(req.file.path);  // Use the file name for Azure Blob
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);  // Get the BlobClient
    await blockBlobClient.uploadFile(req.file.path);  // Upload the file to Azure Blob Storage

    res.send('File uploaded successfully to Azure Blob Storage!');
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).send('Error uploading file');
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});