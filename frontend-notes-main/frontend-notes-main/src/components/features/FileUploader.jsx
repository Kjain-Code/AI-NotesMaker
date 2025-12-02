import React, { useState, useRef } from 'react';
import { Upload, File, X, FileAudio, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function FileUploader({ onFileSelect, selectedFile, onClear, triggerRef }) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // Expose click handler to parent via ref
    React.useImperativeHandle(triggerRef, () => ({
        open: () => fileInputRef.current?.click()
    }));

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            validateAndSelect(file);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            validateAndSelect(file);
        }
    };

    const validateAndSelect = (file) => {
        const validTypes = [
            'application/pdf',
            'text/plain',
            'audio/mpeg',
            'audio/wav',
            'audio/x-m4a',
            'audio/mp4'
        ];
        onFileSelect(file);
    };

    const getFileIcon = (file) => {
        if (file.type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
        if (file.type.includes('audio')) return <FileAudio className="h-8 w-8 text-blue-500" />;
        return <File className="h-8 w-8 text-gray-500" />;
    };

    // Hidden input only
    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileInput}
                accept=".pdf,.txt,.mp3,.wav,.m4a"
            />
            {/* We don't render the drop zone here anymore, handled by parent layout or we can wrap the whole page in drop zone if needed */}
        </>
    );
}
