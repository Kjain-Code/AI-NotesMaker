import React from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function MaterialSelector({ selected, onChange }) {
    const materials = [
        { id: 'summary', label: 'Summary', description: 'Concise overview of the content' },
        { id: 'notes', label: 'Study Notes', description: 'Detailed bullet points' },
        { id: 'keyPoints', label: 'Key Points', description: 'Critical concepts extracted' },
        { id: 'quiz', label: 'Quiz', description: 'Test your knowledge' },
    ];

    const toggle = (id) => {
        if (selected.includes(id)) {
            onChange(selected.filter(item => item !== id));
        } else {
            onChange([...selected, id]);
        }
    };

    return (
        <div className="space-y-3">
            <Label>Select Materials to Generate</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {materials.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => toggle(item.id)}
                        className={cn(
                            "cursor-pointer border rounded-lg p-3 transition-all hover:border-primary/50",
                            selected.includes(item.id)
                                ? "bg-primary/10 border-primary ring-1 ring-primary"
                                : "bg-card border-input"
                        )}
                    >
                        <div className="flex items-center gap-2">
                            <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                selected.includes(item.id) ? "bg-primary border-primary" : "border-muted-foreground"
                            )}>
                                {selected.includes(item.id) && (
                                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{item.label}</p>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
