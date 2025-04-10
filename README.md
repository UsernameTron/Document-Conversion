# Document Conversion & Use-Case Selector

A user-friendly application that allows users to select a use case, choose a target format, upload a document, and receive a converted result.

## Features

- **Use Case Selection**: Choose from a variety of document conversion use cases
- **Format Selection**: Pick the right output format for your needs
- **File Upload**: Easy drag-and-drop file upload interface
- **Document Conversion**: Convert documents between various formats:
  - Text to PDF
  - PDF to Text
  - Word to PDF
  - CSV to JSON
  - JSON to CSV
  - Markdown to HTML
  - HTML to Markdown
  - Excel to CSV
  - OCR for images and scanned PDFs
- **Preview**: Preview converted text-based files
- **Security**: Authentication, rate limiting, and secure file handling
- **Logging**: Comprehensive error and activity logging

## Technology Stack

- **Frontend**: React.js with Next.js
- **Backend**: Node.js with Express
- **Conversion Libraries**: 
  - pdf-lib for PDF generation
  - mammoth for DOCX processing
  - tesseract.js for OCR
  - papaparse for CSV handling
  - marked for Markdown processing
- **Security**: Helmet, JWT authentication, express-rate-limit
- **Logging**: Winston for structured logging

## Project Structure

```
/
├── server/               # Backend server code
│   ├── conversions/      # File conversion modules
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── config.js         # Server configuration
│   ├── logger.js         # Logging setup
│   └── index.js          # Server entry point
├── src/
│   ├── components/       # React components
│   ├── data/             # Static data files
│   ├── models/           # Data models
│   └── theme/            # UI theme and styling
├── pages/                # Next.js pages
├── public/               # Static assets
├── uploads/              # Temporary upload storage
├── converted/            # Converted file storage
└── logs/                 # Application logs
```

## Getting Started

### Using Desktop Launchers

#### macOS
- Simply double-click the `Launch Application.command` file to start the application
- Use `Test Application.command` to run the application in test mode

#### Windows
- Double-click the `Launch Application.bat` file to start the application
- Use `Test Application.bat` to run the application in test mode

The application will automatically:
1. Install dependencies if needed
2. Start the backend server
3. Start the frontend
4. Open the application in your default web browser

### Manual Launch

1. Install dependencies:
   ```
   npm install
   ```
2. Start the development servers:
   ```
   npm run dev:all
   ```
   This will start both the Next.js frontend server and the Express backend server.

## Environment Variables

For production deployment, create a `.env` file with the following variables:

```
NODE_ENV=production
PORT=3333
JWT_SECRET=your-secret-key
COOKIE_SECRET=your-cookie-secret
```

## Deployment

1. Build the frontend:
   ```
   npm run build
   ```
2. Start the production server:
   ```
   npm start
   ```

## Security Considerations

- All JWT secrets and cookie secrets should be changed in production
- File size limits are enforced to prevent DOS attacks
- All uploads are validated and sanitized
- Files are automatically cleaned up after expiration
- Authentication can be enabled for multi-user environments

## License

MIT License