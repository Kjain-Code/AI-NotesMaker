import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

import ReactMarkdown from 'react-markdown';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';

export function ResultDisplay({ results }) {
    if (!results) return null;

    const tabs = Object.keys(results).filter(key => results[key]);
    const [activeTab, setActiveTab] = React.useState(tabs[0]);

    // Ensure active tab is valid if results change
    React.useEffect(() => {
        if (!tabs.includes(activeTab) && tabs.length > 0) {
            setActiveTab(tabs[0]);
        }
    }, [results, tabs, activeTab]);

    if (tabs.length === 0) return null;

    const handleExportText = () => {
        let content = "StudyBuddy Generated Materials\n\n";

        if (results.summary) {
            content += "--- SUMMARY ---\n\n" + results.summary.summary + "\n\n";
        }

        if (results.notes) {
            content += "--- NOTES ---\n\n";
            if (results.notes.definitions) {
                content += "Definitions:\n";
                results.notes.definitions.forEach(d => content += `- ${d.term}: ${d.meaning}\n`);
                content += "\n";
            }
            if (results.notes.concepts) {
                content += "Key Concepts:\n";
                results.notes.concepts.forEach(c => content += `- ${c}\n`);
                content += "\n";
            }
            if (results.notes.bulletNotes) {
                content += "Bullet Notes:\n";
                results.notes.bulletNotes.forEach(n => content += `- ${n}\n`);
                content += "\n";
            }
            if (results.notes.examples) {
                content += "Examples:\n";
                results.notes.examples.forEach(e => content += `- ${e}\n`);
                content += "\n";
            }
        }

        if (results.keyPoints && results.keyPoints.keyPoints) {
            content += "--- KEY POINTS ---\n\n";
            results.keyPoints.keyPoints.forEach((p, i) => content += `${i + 1}. ${p}\n`);
            content += "\n";
        }

        if (results.quiz) {
            content += "--- QUIZ ---\n\n";
            results.quiz.questions.forEach((q, i) => {
                content += `${i + 1}. ${q.question}\n`;
                q.options.forEach((o, oi) => content += `   ${String.fromCharCode(65 + oi)}. ${o}\n`);
                content += `   Answer: ${q.answer}\n\n`;
            });
        }

        if (results.transcription) {
            content += "--- TRANSCRIPTION ---\n\n" + results.transcription + "\n\n";
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'studybuddy_notes.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        let y = 10;
        const lineHeight = 7;
        const pageHeight = doc.internal.pageSize.height;

        const addText = (text, fontSize = 10, isBold = false) => {
            doc.setFontSize(fontSize);
            doc.setFont(undefined, isBold ? 'bold' : 'normal');

            const splitText = doc.splitTextToSize(text, 180);

            if (y + splitText.length * lineHeight > pageHeight - 10) {
                doc.addPage();
                y = 10;
            }

            doc.text(splitText, 10, y);
            y += splitText.length * lineHeight + 2;
        };

        addText("StudyBuddy Generated Materials", 16, true);
        y += 5;

        if (results.summary) {
            addText("Summary", 14, true);
            addText(results.summary.summary);
            y += 5;
        }

        if (results.notes) {
            addText("Notes", 14, true);
            if (results.notes.definitions) {
                addText("Definitions", 12, true);
                results.notes.definitions.forEach(d => addText(`${d.term}: ${d.meaning}`));
            }
            if (results.notes.concepts) {
                addText("Key Concepts", 12, true);
                results.notes.concepts.forEach(c => addText(`- ${c}`));
            }
            if (results.notes.bulletNotes) {
                addText("Bullet Notes", 12, true);
                results.notes.bulletNotes.forEach(n => addText(`- ${n}`));
            }
            if (results.notes.examples) {
                addText("Examples", 12, true);
                results.notes.examples.forEach(e => addText(`- ${e}`));
            }
            y += 5;
        }

        if (results.keyPoints && results.keyPoints.keyPoints) {
            addText("Key Points", 14, true);
            results.keyPoints.keyPoints.forEach((p, i) => addText(`${i + 1}. ${p}`));
            y += 5;
        }

        if (results.quiz) {
            addText("Quiz", 14, true);
            results.quiz.questions.forEach((q, i) => {
                addText(`${i + 1}. ${q.question}`, 11, true);
                q.options.forEach((o, oi) => addText(`   ${String.fromCharCode(65 + oi)}. ${o}`));
                addText(`   Answer: ${q.answer}`, 10, true);
                y += 2;
            });
            y += 5;
        }

        if (results.transcription) {
            addText("Transcription", 14, true);
            addText(results.transcription);
        }

        doc.save('studybuddy_notes.pdf');
    };

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:w-[700px]">
                        {tabs.map(tab => (
                            <TabsTrigger
                                key={tab}
                                isActive={activeTab === tab}
                                onClick={() => setActiveTab(tab)}
                                className="capitalize"
                            >
                                {tab.replace(/([A-Z])/g, ' $1').trim()}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleExportText} className="gap-2">
                            <FileText className="w-4 h-4" />
                            Text
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
                            <Download className="w-4 h-4" />
                            PDF
                        </Button>
                    </div>
                </div>

                <div className="mt-0">
                    {tabs.map(tab => (
                        <TabsContent key={tab} isActive={activeTab === tab}>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="capitalize">{tab.replace(/([A-Z])/g, ' $1').trim()}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {renderContent(tab, results[tab])}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    ))}
                </div>
            </div>
        </div>
    );
}

function renderContent(type, data) {
    if (!data) return <p className="text-muted-foreground">No data available.</p>;

    switch (type) {
        case 'summary':
            return (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="leading-relaxed">{data.summary}</p>
                </div>
            );

        case 'notes':
            return (
                <div className="space-y-6">
                    {data.definitions && data.definitions.length > 0 && (
                        <Section title="Definitions">
                            <div className="grid gap-3 md:grid-cols-2">
                                {data.definitions.map((def, i) => (
                                    <div key={i} className="p-3 rounded-md bg-secondary/20 border">
                                        <span className="font-semibold text-primary">{def.term}:</span> {def.meaning}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    {data.concepts && data.concepts.length > 0 && (
                        <Section title="Key Concepts">
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                {data.concepts.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </Section>
                    )}

                    {data.bulletNotes && data.bulletNotes.length > 0 && (
                        <Section title="Notes">
                            <ul className="space-y-2">
                                {data.bulletNotes.map((note, i) => (
                                    <li key={i} className="flex gap-2 items-start">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                        <span>{note}</span>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}

                    {data.examples && data.examples.length > 0 && (
                        <Section title="Examples">
                            <div className="space-y-2">
                                {data.examples.map((ex, i) => (
                                    <div key={i} className="text-sm italic border-l-2 border-primary/50 pl-3 py-1">
                                        {ex}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}
                </div>
            );

        case 'keyPoints':
            return (
                <ul className="space-y-3">
                    {data.keyPoints?.map((point, i) => (
                        <li key={i} className="flex gap-3 p-3 rounded-lg bg-secondary/10 border hover:bg-secondary/20 transition-colors">
                            <span className="font-bold text-primary/50">{(i + 1).toString().padStart(2, '0')}</span>
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            );

        case 'quiz':
            return <QuizDisplay questions={data.questions} />;

        case 'transcription':
            return (
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    <p className="leading-relaxed">{data}</p>
                </div>
            );

        default:
            return <pre className="text-xs overflow-auto p-4 bg-muted rounded-md">{JSON.stringify(data, null, 2)}</pre>;
    }
}

function Section({ title, children }) {
    return (
        <div className="space-y-2">
            <h4 className="font-medium text-lg border-b pb-1">{title}</h4>
            {children}
        </div>
    );
}


function QuizDisplay({ questions }) {
    const [answers, setAnswers] = React.useState({});
    const [showResults, setShowResults] = React.useState(false);

    if (!questions || questions.length === 0) return <p>No questions generated.</p>;

    const handleSelect = (qIndex, optionIndex) => {
        if (showResults) return;
        const optionLetter = String.fromCharCode(65 + optionIndex);
        setAnswers(prev => ({ ...prev, [qIndex]: optionLetter }));
    };

    const score = questions.reduce((acc, q, i) => {
        return acc + (answers[i] === q.answer ? 1 : 0);
    }, 0);

    return (
        <div className="space-y-8">
            {showResults && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary text-center">
                    <p className="text-2xl font-bold text-primary">Score: {score} / {questions.length}</p>
                    <p className="text-muted-foreground">
                        {score === questions.length ? 'Perfect!' : score > questions.length / 2 ? 'Good job!' : 'Keep studying!'}
                    </p>
                </div>
            )}

            <div className="space-y-8">
                {questions.map((q, i) => {
                    const isCorrect = answers[i] === q.answer;
                    const isAnswered = answers[i] !== undefined;

                    return (
                        <div key={i} className="space-y-3">
                            <p className="font-medium text-lg">
                                <span className="text-muted-foreground mr-2">{i + 1}.</span>
                                {q.question}
                            </p>
                            <div className="grid gap-2">
                                {q.options.map((opt, optIndex) => {
                                    const optionLetter = String.fromCharCode(65 + optIndex);
                                    const isSelected = answers[i] === optionLetter;
                                    const isRightAnswer = q.answer === optionLetter;

                                    let variant = "outline"; // default style
                                    let icon = null;

                                    if (showResults) {
                                        if (isRightAnswer) {
                                            variant = "success"; // custom style logic below
                                            icon = <CheckCircle className="w-4 h-4 text-green-500" />;
                                        } else if (isSelected && !isRightAnswer) {
                                            variant = "error";
                                            icon = <XCircle className="w-4 h-4 text-red-500" />;
                                        }
                                    } else if (isSelected) {
                                        variant = "selected";
                                    }

                                    return (
                                        <div
                                            key={optIndex}
                                            onClick={() => handleSelect(i, optIndex)}
                                            className={cn(
                                                "p-3 rounded-md border cursor-pointer flex items-center justify-between transition-all",
                                                !showResults && "hover:bg-secondary/50",
                                                variant === "selected" && "bg-primary/10 border-primary ring-1 ring-primary",
                                                variant === "success" && "bg-green-500/10 border-green-500",
                                                variant === "error" && "bg-red-500/10 border-red-500",
                                                showResults && !isRightAnswer && !isSelected && "opacity-50"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className={cn(
                                                    "w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium",
                                                    variant === "selected" ? "bg-primary text-primary-foreground border-primary" : "bg-muted"
                                                )}>
                                                    {optionLetter}
                                                </span>
                                                <span>{opt}</span>
                                            </div>
                                            {icon}
                                        </div>
                                    );
                                })}
                            </div>
                            {showResults && (
                                <div className="mt-2 p-3 rounded-md bg-muted/50 text-sm">
                                    <span className="font-semibold">Explanation:</span> {q.explanation}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {!showResults ? (
                <button
                    onClick={() => setShowResults(true)}
                    disabled={Object.keys(answers).length < questions.length}
                    className="w-full py-2 rounded-md bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
                >
                    Submit Quiz
                </button>
            ) : (
                <button
                    onClick={() => {
                        setShowResults(false);
                        setAnswers({});
                    }}
                    className="w-full py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground font-medium transition-colors"
                >
                    Retake Quiz
                </button>
            )}
        </div>
    );
}
