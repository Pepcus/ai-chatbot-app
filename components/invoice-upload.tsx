'use client';

import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface InvoiceDetails {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  balance_amount: string;
  due_amount: string;
  paid_to: string;
  file_path: string;
}

interface UploadedFile {
  filename: string;
  details: InvoiceDetails;
}

const InvoiceUpload: React.FC = () => {
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [billFile, setBillFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [uploadedInvoice, setUploadedInvoice] = useState<UploadedFile | null>(null);
  const [uploadedBill, setUploadedBill] = useState<UploadedFile | null>(null);
  const invoiceFileInputRef = useRef<HTMLInputElement>(null);
  const billFileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleInvoiceFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setInvoiceFile(event.target.files[0]);
      setMessage('');
    }
  };

  const handleBillFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setBillFile(event.target.files[0]);
      setMessage('');
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!invoiceFile || !billFile) {
      setMessage('Please select both files first.');
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
      formData.append('invoice_file', invoiceFile);
      formData.append('bill_file', billFile);

      const response = await fetch(`${API_SERVER_URL}/api/invoice/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_CLIENT_SECRET}`
        },
        body: formData
      });

      if (response.ok) {
        const responseData = await response.json();
        setUploadedInvoice({
          filename: responseData.invoice.filename,
          details: {
            ...responseData.invoice,
            file_path: responseData.invoice.file_path
          }
        });
        setUploadedBill({
          filename: responseData.bill.filename,
          details: {
            ...responseData.bill,
            file_path: responseData.bill.file_path
          }
        });
        setMessage('Files successfully uploaded.');
        setInvoiceFile(null);
        setBillFile(null);
        if (invoiceFileInputRef.current) invoiceFileInputRef.current.value = ''; // Reset invoice file input
        if (billFileInputRef.current) billFileInputRef.current.value = ''; // Reset bill file input
      } else {
        const errorText = await response.text();
        setMessage(`File upload failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
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
    setInvoiceFile(null);
    setBillFile(null);
    setMessage('');
    setUploadedInvoice(null);
    setUploadedBill(null);
    if (invoiceFileInputRef.current) invoiceFileInputRef.current.value = ''; // Reset invoice file input
    if (billFileInputRef.current) billFileInputRef.current.value = ''; // Reset bill file input
  };

  return (
    <div className="flex flex-col items-center justify-start w-full h-screen bg-gray-100 px-4 py-8">
      <div className="w-full max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Invoice and Bill Upload</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col justify-center items-center bg-gray-50 p-4 rounded">
            <div className="mb-4 w-full">
              <label className="block text-sm font-medium text-gray-700">Upload Invoice</label>
              <input 
                ref={invoiceFileInputRef}
                type="file" 
                onChange={handleInvoiceFileChange} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Upload Bill</label>
              <input 
                ref={billFileInputRef}
                type="file" 
                onChange={handleBillFileChange} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-150"
            disabled={!invoiceFile || !billFile}
          >
            Upload Files
          </button>
        </form>
        {message && (
          <div className="mt-4 text-center text-sm text-gray-600">
            {message}
          </div>
        )}
        {uploadedInvoice && uploadedBill && (
          <div className="overflow-x-auto mt-6 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h2 className="text-xl font-bold mb-4">Invoice Details</h2>
                <table className="min-w-full text-sm text-left text-gray-500">
                  <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                    <tr>
                      <th className="px-6 py-3">Field</th>
                      <th className="px-6 py-3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Invoice Number</td>
                      <td className="px-6 py-4">{uploadedInvoice.details.invoice_number}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Invoice Date</td>
                      <td className="px-6 py-4">{uploadedInvoice.details.invoice_date}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Due Date</td>
                      <td className="px-6 py-4">{uploadedInvoice.details.due_date}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Balance Amount</td>
                      <td className="px-6 py-4">{uploadedInvoice.details.balance_amount}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Due Amount</td>
                      <td className="px-6 py-4">{uploadedInvoice.details.due_amount}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Paid To</td>
                      <td className="px-6 py-4">{uploadedInvoice.details.paid_to}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4">
                  <a href={`${process.env.API_SERVER_URL}/download/${uploadedInvoice.filename}`} download className="text-blue-600 hover:text-blue-800">
                    Download Invoice
                  </a>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-4">Bill Details</h2>
                <table className="min-w-full text-sm text-left text-gray-500">
                  <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                    <tr>
                      <th className="px-6 py-3">Field</th>
                      <th className="px-6 py-3">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Invoice Number</td>
                      <td className="px-6 py-4">{uploadedBill.details.invoice_number}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Invoice Date</td>
                      <td className="px-6 py-4">{uploadedBill.details.invoice_date}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Due Date</td>
                      <td className="px-6 py-4">{uploadedBill.details.due_date}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Balance Amount</td>
                      <td className="px-6 py-4">{uploadedBill.details.balance_amount}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Due Amount</td>
                      <td className="px-6 py-4">{uploadedBill.details.due_amount}</td>
                    </tr>
                    <tr className="bg-white border-b">
                      <td className="px-6 py-4">Paid To</td>
                      <td className="px-6 py-4">{uploadedBill.details.paid_to}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="mt-4">
                  <a href={`${process.env.API_SERVER_URL}/download/${uploadedBill.filename}`} download className="text-blue-600 hover:text-blue-800">
                    Download Bill
                  </a>
                </div>
              </div>
            </div>
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleAccept}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mr-8 transition-colors duration-150"
              >
                Accept
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors duration-150"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceUpload;
