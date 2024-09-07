const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const multer = require('multer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Ensure the 'uploads/' directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure Multer to store files in the 'uploads/' folder
const upload = multer({ dest: 'uploads/' });

// Route to handle image upload and recognition
app.post('/recognize-image', upload.single('image'), async (req, res) => {
  // Log the file object to help with debugging
  console.log(req.file);

  // Check if a file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const imagePath = req.file.path;

  try {
    // Prepare form data with the image file
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));

    const response = await axios.post('https://api.imagga.com/v2/tags', form, {
      headers: {
        Authorization:
          'Basic ' + Buffer.from(`${process.env.IMAGGA_API_KEY}:${process.env.IMAGGA_API_SECRET}`).toString('base64'),
        ...form.getHeaders(), // Include form headers
      },
    });

    // Clean up the uploaded file after processing
    fs.unlinkSync(imagePath);

    // Return the recognized tags
    return res.json(response.data);
  } catch (error) {
    console.error('Error recognizing image:', error);

    // Clean up the uploaded file if an error occurs
    fs.unlinkSync(imagePath);

    return res.status(500).json({ error: 'Error recognizing image' });
  }
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//! the below code will only give the names the match with the image from 60% to 100%

// const express = require('express');
// const axios = require('axios');
// const FormData = require('form-data');
// const fs = require('fs');
// const multer = require('multer');
// const dotenv = require('dotenv');

// // Load environment variables
// dotenv.config();

// const app = express();
// const upload = multer({ dest: 'uploads/' }); // Multer will store files in the 'uploads' folder

// // Route to handle image upload and recognition
// app.post('/recognize-image', upload.single('image'), async (req, res) => {
//   const imagePath = req.file.path;

//   try {
//     // Prepare form data with the image file
//     const form = new FormData();
//     form.append('image', fs.createReadStream(imagePath));

//     const response = await axios.post('https://api.imagga.com/v2/tags', form, {
//       headers: {
//         Authorization:
//           'Basic ' + Buffer.from(`${process.env.IMAGGA_API_KEY}:${process.env.IMAGGA_API_SECRET}`).toString('base64'),
//         ...form.getHeaders(), // Include form headers
//       },
//     });

//     // Filter tags with confidence >= 60%
//     const tags = response.data.result.tags.filter((tag) => tag.confidence >= 60).map((tag) => tag.tag.en);

//     // Clean up the uploaded file after processing
//     fs.unlinkSync(imagePath);

//     // Return the filtered tags
//     return res.json({ tags });
//   } catch (error) {
//     console.error('Error recognizing image:', error);

//     // Clean up the uploaded file if an error occurs
//     fs.unlinkSync(imagePath);

//     return res.status(500).json({ error: 'Error recognizing image' });
//   }
// });

// // Start the server on port 3000
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
