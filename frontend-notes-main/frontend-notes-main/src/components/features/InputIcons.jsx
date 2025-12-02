import React from 'react';
import { FileText, FileAudio, Type, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function InputIcons({ onSelect }) {
    const icons = [
        { id: 'text', label: 'Text', icon: Type },
        { id: 'youtube', label: 'YouTube', icon: Youtube },
        { id: 'pdf', label: 'PDF', icon: FileText },
        // { id: 'image', label: 'Image', icon: Image }, // Unsupported
        // { id: 'capture', label: 'Capture', icon: Camera }, // Unsupported
        // { id: 'web', label: 'Web', icon: Globe }, // Unsupported
        { id: 'audio', label: 'Audio', icon: FileAudio },
    ];

    return (
        <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {icons.map((item) => (
                <motion.button
                    key={item.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onSelect(item.id)}
                    className="flex flex-col items-center gap-2 group"
                >
                    <div className="w-14 h-14 rounded-2xl bg-card border border-white/5 flex items-center justify-center group-hover:bg-secondary/80 group-hover:border-primary/20 transition-all shadow-lg shadow-black/20">
                        <item.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.label}
                    </span>
                </motion.button>
            ))}
        </div>
    );
}
