import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ProcessingProgress({ currentStep, steps }) {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-primary/20 bg-card/50 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Processing Your Content</CardTitle>
                        <p className="text-muted-foreground">Please wait while we generate your study materials</p>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                        {steps.map((step, index) => {
                            const isCompleted = index < currentStep;
                            const isActive = index === currentStep;
                            const isPending = index > currentStep;

                            return (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-lg border transition-all duration-300",
                                        isCompleted && "bg-green-500/10 border-green-500/50",
                                        isActive && "bg-primary/10 border-primary animate-pulse",
                                        isPending && "bg-muted/30 border-muted"
                                    )}
                                >
                                    <div className="shrink-0">
                                        {isCompleted && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                            >
                                                <CheckCircle className="w-6 h-6 text-green-500" />
                                            </motion.div>
                                        )}
                                        {isActive && (
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                        )}
                                        {isPending && (
                                            <Circle className="w-6 h-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={cn(
                                            "font-medium transition-colors",
                                            isCompleted && "text-green-500",
                                            isActive && "text-primary",
                                            isPending && "text-muted-foreground"
                                        )}>
                                            {step.label}
                                        </p>
                                        {step.description && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {step.description}
                                            </p>
                                        )}
                                    </div>
                                    {isCompleted && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-xs text-green-500 font-medium"
                                        >
                                            Complete
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
