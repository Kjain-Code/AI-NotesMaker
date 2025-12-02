'use client';

import React, { useState, useRef } from 'react';
import { FileUploader } from '@/components/features/FileUploader';
import { TextInput } from '@/components/features/TextInput';
import { YouTubeInput } from '@/components/features/YouTubeInput';
import { MaterialSelector } from '@/components/features/MaterialSelector';
import { ResultDisplay } from '@/components/features/ResultDisplay';
import { ActionCard } from '@/components/features/ActionCard';
import { InputIcons } from '@/components/features/InputIcons';
import { ProcessingProgress } from '@/components/features/ProcessingProgress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles, AlertCircle, Mic, UploadCloud, X, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"

export default function Home() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [materials, setMaterials] = useState(['summary', 'notes', 'keyPoints', 'quiz']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showYoutubeInput, setShowYoutubeInput] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiDialog, setShowApiDialog] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [processingStep, setProcessingStep] = useState(0);
  const [processingSteps, setProcessingSteps] = useState([]);

  const fileUploaderRef = useRef(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setText('');
    setYoutubeUrl('');
    setShowTextInput(false);
    setShowYoutubeInput(false);
  };

  const handleIconSelect = (id) => {
    if (id === 'text') {
      setShowTextInput(true);
      setShowYoutubeInput(false);
      setFile(null);
      setYoutubeUrl('');
    } else if (id === 'youtube') {
      setShowYoutubeInput(true);
      setShowTextInput(false);
      setFile(null);
      setText('');
    } else if (id === 'pdf' || id === 'audio') {
      fileUploaderRef.current?.open();
    }
  };

  const handleProcess = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    setProcessingStep(0);

    // Build processing steps based on what materials are selected
    const steps = [];

    if (file) {
      steps.push({
        id: 'upload',
        label: 'Uploading file',
        description: 'Sending your file to the server'
      });
      steps.push({
        id: 'extraction',
        label: 'Extracting content',
        description: file.type.startsWith('audio') || file.type.startsWith('video') ? 'Transcribing audio...' : 'Reading file content...'
      });
    } else if (youtubeUrl) {
      steps.push({
        id: 'youtube',
        label: 'Fetching YouTube transcript',
        description: 'Extracting video captions...'
      });
    } else {
      steps.push({
        id: 'preparation',
        label: 'Preparing text',
        description: 'Processing your input'
      });
    }

    if (materials.includes('summary')) {
      steps.push({
        id: 'summary',
        label: 'Generating Summary',
        description: 'Creating comprehensive summary'
      });
    }

    if (materials.includes('notes')) {
      steps.push({
        id: 'notes',
        label: 'Creating Notes',
        description: 'Extracting key concepts and definitions'
      });
    }

    if (materials.includes('keyPoints')) {
      steps.push({
        id: 'keyPoints',
        label: 'Extracting Key Points',
        description: 'Identifying main takeaways'
      });
    }

    if (materials.includes('quiz')) {
      steps.push({
        id: 'quiz',
        label: 'Generating Quiz',
        description: 'Creating practice questions'
      });
    }

    steps.push({
      id: 'finalizing',
      label: 'Finalizing',
      description: 'Preparing your study materials'
    });

    setProcessingSteps(steps);

    try {
      let currentStepIndex = 0;
      let processedText = '';
      let transcription = null;

      if (file) {
        // Step: Upload
        setProcessingStep(currentStepIndex++);

        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch('http://localhost:3001/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || 'Upload failed');
        }

        // Step: Extraction
        setProcessingStep(currentStepIndex++);

        const uploadData = await uploadRes.json();
        processedText = uploadData.text;

        // If it was audio/video, we might have source text as transcription
        if (file.type.startsWith('audio') || file.type.startsWith('video')) {
          transcription = uploadData.text;
        }

      } else if (youtubeUrl.trim()) {
        // Step: YouTube
        setProcessingStep(currentStepIndex++);

        console.log('YouTube URL being sent:', youtubeUrl);
        console.log('Request body:', JSON.stringify({ url: youtubeUrl }));

        const youtubeRes = await fetch('http://localhost:3001/api/youtube/transcript', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: youtubeUrl }),
        });

        console.log('YouTube response status:', youtubeRes.status);

        if (!youtubeRes.ok) {
          const err = await youtubeRes.json();
          console.error('YouTube error response:', err);
          throw new Error(err.error || 'YouTube transcript extraction failed');
        }

        const youtubeData = await youtubeRes.json();
        processedText = youtubeData.text;
        transcription = youtubeData.text;

      } else if (text.trim()) {
        // Step: Preparation
        setProcessingStep(currentStepIndex++);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for UX
        processedText = text;
      } else {
        throw new Error('Please provide a file, YouTube URL, or text to process');
      }

      if (!processedText) {
        throw new Error('No text could be extracted');
      }

      // Move to material generation steps
      setProcessingStep(currentStepIndex++);

      const headers = {
        'Content-Type': 'application/json',
      };

      if (apiKey) {
        headers['x-groq-api-key'] = apiKey;
      }

      const processRes = await fetch('http://localhost:3001/api/process', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          text: processedText,
          materialTypes: materials,
          transcription: transcription // Pass transcription to be included in response
        }),
      });

      if (!processRes.ok) {
        const err = await processRes.json();
        throw new Error(err.error || 'Processing failed');
      }

      // Update step for each material being generated (simulated progress)
      const materialCount = materials.length;
      for (let i = 1; i < materialCount; i++) {
        setProcessingStep(currentStepIndex++);
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const processData = await processRes.json();

      // Step: Finalizing
      setProcessingStep(currentStepIndex++);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Combine generated data with transcription if available
      const finalResults = {
        ...processData.data,
        transcription: processData.transcription || transcription
      };

      setResults(finalResults);

    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setFile(null);
    setText('');
    setYoutubeUrl('');
    setResults(null);
    setShowTextInput(false);
    setShowYoutubeInput(false);
  };

  const saveApiKey = () => {
    setApiKey(tempApiKey);
    setShowApiDialog(false);
  };

  return (
    <main className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 md:px-12 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">StudyBuddy</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {/* Links removed as requested */}
        </div>

        <Dialog open={showApiDialog} onOpenChange={setShowApiDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-full px-6 gap-2">
              <Key className="w-4 h-4" />
              {apiKey ? 'API Key Set' : 'Use your own API'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Groq API Key</DialogTitle>
              <DialogDescription>
                Your API key is stored locally in your browser session and sent directly to the backend.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  placeholder="gsk_..."
                  type="password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={saveApiKey}>Save Key</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 space-y-16">

        {/* Processing Progress View */}
        {loading && (
          <ProcessingProgress currentStep={processingStep} steps={processingSteps} />
        )}

        {/* Hero Section */}
        {!results && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/50 text-xs font-medium text-primary mb-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              AI Note Taker
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              #1 AI <span className="text-gradient">Note Taker</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Turn any audio, meeting, or file into clear, actionable notes.
            </p>
          </motion.div>
        )}

        {/* Main Action Area */}
        {!results && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-3xl mx-auto space-y-12"
          >
            {/* Primary Action Card */}
            <div className="grid md:grid-cols-1 gap-6 justify-center">
              {/* We only want one big card for import as requested */}
              <ActionCard
                title="Import File"
                description="Upload Audio, PDF, or Text files"
                icon={UploadCloud}
                onClick={() => fileUploaderRef.current?.open()}
              />
            </div>

            {/* Secondary Icons */}
            <InputIcons onSelect={handleIconSelect} />

            {/* Hidden File Uploader */}
            <FileUploader
              triggerRef={fileUploaderRef}
              onFileSelect={handleFileSelect}
              selectedFile={file}
              onClear={() => setFile(null)}
            />
          </motion.div>
        )}

        {/* Active State / Configuration Modal (Inline for now) */}
        <AnimatePresence>
          {(file || showTextInput || showYoutubeInput) && !results && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Generate Materials</CardTitle>
                    <CardDescription>Configure your study guide</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearAll}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Selected File Display */}
                  {file && (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-white/5">
                      <div className="p-2 rounded bg-blue-500/20">
                        <UploadCloud className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change</Button>
                    </div>
                  )}

                  {/* YouTube Input Area */}
                  {showYoutubeInput && (
                    <YouTubeInput value={youtubeUrl} onChange={setYoutubeUrl} />
                  )}

                  {/* Text Input Area */}
                  {showTextInput && (
                    <TextInput value={text} onChange={setText} placeholder="Paste your lecture notes or text here..." />
                  )}

                  <div className="grid gap-6 md:grid-cols-1">
                    {/* Model Selector Removed */}
                    <MaterialSelector selected={materials} onChange={setMaterials} />
                  </div>

                  <Button
                    className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
                    size="lg"
                    onClick={handleProcess}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Study Guide
                      </>
                    )}
                  </Button>

                  {error && (
                    <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Your Study Guide</h2>
              <Button variant="outline" onClick={clearAll}>
                Create New
              </Button>
            </div>
            <ResultDisplay results={results} />
          </motion.div>
        )}

      </div>
    </main>
  );
}
