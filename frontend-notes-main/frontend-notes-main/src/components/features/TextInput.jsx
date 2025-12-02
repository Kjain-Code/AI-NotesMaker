import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function TextInput({ value, onChange, placeholder = "Paste your text here..." }) {
    return (
        <div className="space-y-2">
            <Label htmlFor="text-input">Direct Text Input</Label>
            <Textarea
                id="text-input"
                placeholder={placeholder}
                className="min-h-[200px] font-mono text-sm resize-y"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
