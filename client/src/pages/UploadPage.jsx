import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { UploadCloud, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: upload, 1: analyzing, 2: success
  const navigate = useNavigate();

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1 
  });

  const handleUpload = async () => {
    if (!file) return;
    
    setLoading(true);
    setStep(1);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Step 1: Upload and extract text
      const uploadRes = await axios.post('http://localhost:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const { preview } = uploadRes.data;
      
      // Step 2: Trigger analysis (CrewAI)
      toast.success("File uploaded. Analyzing document...", { icon: '🤖' });
      await axios.post('http://localhost:8000/api/analyze', { text: preview });
      
      setStep(2);
      toast.success("Analysis Complete! Redirecting to Dashboard.");
      setTimeout(() => navigate('/dashboard'), 2000);
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to process document');
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-700">
          <h1 className="text-3xl font-bold mb-2 text-center text-blue-400">Upload Past Paper</h1>
          <p className="text-gray-400 text-center mb-8">Drop your PDF below to map topics, estimate difficulty, and generate a study plan.</p>
          
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer
              ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'}
              ${step > 0 ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            
            {file ? (
              <div className="text-blue-400 font-medium flex items-center justify-center gap-2">
                <FileText size={20} /> {file.name}
              </div>
            ) : isDragActive ? (
              <p className="text-blue-400 font-medium text-lg">Drop the PDF here ...</p>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-300">Drag & drop a past paper PDF here, or click to select</p>
                <p className="text-sm text-gray-500 mt-2">Only .pdf formats supported</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`px-8 py-3 rounded-lg font-bold text-white transition-all flex items-center gap-2
                ${!file || loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20'}`}
            >
              {step === 0 && 'Start Intelligent Analysis'}
              {step === 1 && <><Loader2 className="animate-spin" /> Agents Analyzing...</>}
              {step === 2 && <><CheckCircle /> Analysis Complete</>}
            </button>
          </div>
          
          {step === 1 && (
             <div className="mt-8 max-w-md mx-auto">
               <div className="h-2 w-full bg-gray-700 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 animate-pulse w-[60%]"></div>
               </div>
               <p className="text-center text-sm text-gray-400 mt-3 animate-pulse">Running CrewAI topic extraction...</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UploadPage;
