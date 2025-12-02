import React from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export function ActionCard({ onClick, title, description, icon: Icon }) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer group relative overflow-hidden rounded-2xl bg-card border border-white/5 p-8 md:p-12 hover:bg-secondary/50 transition-colors"
            onClick={onClick}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                <div className="p-4 rounded-full bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                    {Icon ? <Icon className="w-8 h-8 text-primary" /> : <UploadCloud className="w-8 h-8 text-primary" />}
                </div>
                <h3 className="text-xl font-semibold text-foreground">{title}</h3>
                <p className="text-muted-foreground text-sm max-w-[200px]">{description}</p>
            </div>
        </motion.div>
    );
}
