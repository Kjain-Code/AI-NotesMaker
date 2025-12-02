import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Youtube, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function YouTubeInput({ value, onChange, className }) {
    const [isValid, setIsValid] = useState(null);

    const validateYouTubeUrl = (url) => {
        if (!url || url.trim().length === 0) {
            setIsValid(null);
            return false;
        }

        // YouTube URL patterns
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
            /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
        ];

        const valid = patterns.some(pattern => pattern.test(url.trim()));
        setIsValid(valid);
        return valid;
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        onChange(newValue);
        validateYouTubeUrl(newValue);
    };

    const handlePaste = (e) => {
        // Small delay to allow paste to complete
        setTimeout(() => {
            validateYouTubeUrl(e.target.value);
        }, 10);
    };

    return (
        <div className={cn("space-y-3", className)}>
            <Label htmlFor="youtube-url" className="text-sm font-medium flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                YouTube Video URL
            </Label>
            <div className="relative">
                <Input
                    id="youtube-url"
                    type="url"
                    value={value}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                    className={cn(
                        "pr-10 transition-all",
                        isValid === true && "border-green-500/50 focus:border-green-500",
                        isValid === false && "border-red-500/50 focus:border-red-500"
                    )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isValid === true && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                    )}
                    {isValid === false && (
                        <XCircle className="w-5 h-5 text-red-500" />
                    )}
                </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ExternalLink className="w-3 h-3" />
                Paste any YouTube video URL or video ID (video must have captions/subtitles enabled)
            </p>
            {isValid === false && value.trim().length > 0 && (
                <p className="text-xs text-red-500">
                    Invalid YouTube URL. Please use formats like: youtube.com/watch?v=... or youtu.be/...
                </p>
            )}
        </div>
    );
}
