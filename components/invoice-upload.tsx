'use client';

import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface InvoiceDetails {
  [key: string]: string;
}

interface UploadedFile {
  filename: string;
  details: InvoiceDetails;
}

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setMessage('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setMessage('Please select a file first.');
      return;
    }

    const API_SERVER_URL = process.env.API_SERVER_URL;
    const API_CLIENT_SECRET = process.env.API_CLIENT_SECRET;

    if (!API_SERVER_URL || !API_CLIENT_SECRET) {
      setMessage('API configuration is missing.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_SERVER_URL}/api/invoice/upload`, {
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
        setUploadedFile({ filename: responseData.filename, details });
        setMessage(`File successfully uploaded.`);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
      } else {
        const errorText = await response.text();
        setMessage(`File upload failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage('File upload failed due to a network or server error.');
    }
  };

  const handleAccept = async () => {
    const API_SERVER_URL = process.env.API_SERVER_URL;
    const API_CLIENT_SECRET = process.env.API_CLIENT_SECRET;

    try {
      const response = await fetch(`${API_SERVER_URL}/api/invoice/reconsile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CLIENT_SECRET}`
        }
      });

      if (response.ok) {
        setMessage('Invoice accepted successfully.');
      } else {
        const errorText = await response.text();
        setMessage(`Accept action failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error accepting invoice:', error);
      setMessage('Accept action failed due to a network or server error.');
    }
  };

  const handleReject = () => {
    // Clear the state
    setFile(null);
    setMessage('');
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
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
        {uploadedFile && (
          <div className="overflow-x-auto mt-6 w-full">
            <table className="min-w-full text-sm text-left text-gray-500">
              <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Uploaded File</th>
                  <th className="px-6 py-3">Details</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4">{uploadedFile.filename}</td>
                  <td className="px-6 py-4 whitespace-pre-wrap">
                    {Object.entries(uploadedFile.details).map(([key, value]) => (
                      <div key={key}>
                        <strong>{key}:</strong> {value}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={handleAccept}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mr-2 transition-colors duration-150"
                    >
                      Accept
                    </button>
                    <button
                      onClick={handleReject}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors duration-150"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
