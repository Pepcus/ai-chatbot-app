'use client';

import { useState, ChangeEvent, FormEvent, useRef } from 'react';

interface InvoiceDetails {
  [key: string]: string;
}

interface UploadedFile {
  filename: string;
  details: InvoiceDetails;
}

const FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
      setMessage('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length === 0) {
      setMessage('Please select files first.');
      return;
    }

    const API_SERVER_URL = 'http://127.0.0.1:8000';
    const API_CLIENT_SECRET = 'YXBpX3VzZXI6OXlQdlJtRDV3WA==';

    try {
      const uploadedFilesDetails: UploadedFile[] = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_SERVER_URL}/api/invoice`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_CLIENT_SECRET}`
          },
          body: formData
        });

        if (response.ok) {
          const responseData = await response.json();
          const details: InvoiceDetails = {
            "Invoice Number": responseData.invoiceNumber,
            "Invoice Date": responseData.invoiceDate,
            "Due Date": responseData.dueDate,
            "Balance Amount": responseData.balanceAmount,
            "Due Amount": responseData.dueAmount,
            "Paid To": responseData.paidTo
          };
          uploadedFilesDetails.push({ filename: responseData.filename, details });
        } else {
          const errorText = await response.text();
          setMessage(`File upload failed: ${errorText}`);
          return;
        }
      }
      setUploadedFiles(uploadedFilesDetails); // Replace previous files with new ones
      setMessage(`Files successfully uploaded.`);
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('File upload failed due to a network or server error.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-screen bg-gray-100 px-4 py-8">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Invoice Upload</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center items-center bg-gray-50 p-4 rounded">
            <input 
              ref={fileInputRef}
              type="file" 
              multiple
              onChange={handleFileChange} 
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-150"
          >
            Upload
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm text-gray-600">
            {message}
          </div>
        )}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
              <tr>
                <th className="px-6 py-3">Uploaded File</th>
                <th className="px-6 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {uploadedFiles.map((file, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="px-6 py-4">{file.filename}</td>
                  <td className="px-6 py-4 whitespace-pre-wrap">
                    {Object.entries(file.details).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
