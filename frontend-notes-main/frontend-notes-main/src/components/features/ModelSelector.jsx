import React, { useEffect, useState } from 'react';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

export function ModelSelector({ value, onSelect }) {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchModels() {
            try {
                const res = await fetch('http://localhost:3001/api/process/models');
                if (res.ok) {
                    const data = await res.json();
                    setModels(data.models || []);
                    // Set default if not set
                    if (!value && data.models.length > 0) {
                        onSelect(data.models[0].id);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch models", error);
            } finally {
                setLoading(false);
            }
        }
        fetchModels();
    }, []);

    return (
        <div className="space-y-2">
            <Label>Select AI Model</Label>
            <Select
                value={value}
                onChange={(e) => onSelect(e.target.value)}
                disabled={loading}
            >
                {loading ? (
                    <option>Loading models...</option>
                ) : (
                    models.map((model) => (
                        <option key={model.id} value={model.id}>
                            {model.name || model.id}
                        </option>
                    ))
                )}
            </Select>
        </div>
    );
}
