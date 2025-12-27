'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AuthShell } from '@/components/layout/auth-shell';

type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export default function AssessmentPage() {
    const router = useRouter();
    const [level, setLevel] = useState<ProficiencyLevel | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLevelSelect = (selectedLevel: ProficiencyLevel) => {
        setLevel(selectedLevel);
        setError(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!level) {
            setError('Please select your English level.');
            return;
        }

        if (level !== 'beginner' && !file) {
            setError('Please upload your EF SET certificate.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let certificateUrl = null;

            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const errorData = await uploadRes.json();
                    throw new Error(errorData.error || 'Failed to upload certificate.');
                }

                const uploadData = await uploadRes.json();
                if (uploadData.success && uploadData.url) {
                    certificateUrl = uploadData.url;
                } else {
                    throw new Error('Failed to get certificate URL.');
                }
            }

            const token = localStorage.getItem('token');
            const response = await fetch('/api/student/assessment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    english_proficiency: level,
                    proficiency_certificate: certificateUrl,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Submission failed');
            }

            router.push('/student'); // Redirect to dashboard

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthShell
            title="English Proficiency Assessment"
            subtitle="Let's determine your current English level to personalize your learning path."
            description="Select the level that best describes you. If you are unsure, take the test below."
            footer={<p className="text-gray-500 text-sm">You can always update this later in your profile settings.</p>}
        >
            <div className="space-y-6">
                {error && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <div className="space-y-3">
                    <Label>Select your English Level</Label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {(['beginner', 'intermediate', 'advanced'] as ProficiencyLevel[]).map((l) => (
                            <button
                                key={l}
                                onClick={() => handleLevelSelect(l)}
                                className={`p-4 rounded-xl border text-sm font-semibold capitalize transition-all ${level === l
                                    ? 'border-gray-900 bg-gray-900 text-white'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                                    }`}
                            >
                                {l}
                            </button>
                        ))}
                    </div>
                </div>

                {level && level !== 'beginner' && (
                    <div className="space-y-4 rounded-2xl bg-gray-50 p-5 border border-gray-100">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-gray-900">Certificate Required</h4>
                            <p className="text-sm text-gray-600">
                                Since you selected <strong>{level}</strong>, please provide a valid certificate.
                                We recommend the <a href="https://www.efset.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">EF Standard English Test (EF SET)</a>.
                                It's free and recognized worldwide.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="certificate">Upload Certificate (PDF or Image)</Label>
                            <Input
                                id="certificate"
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleFileChange}
                                className="bg-white border-gray-300"
                            />
                        </div>
                    </div>
                )}

                {level === 'beginner' && (
                    <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
                        <p className="text-sm text-gray-600">
                            Great! We will start with the basics. No certificate is required for the Beginner level.
                        </p>
                    </div>
                )}

                <Button
                    onClick={handleSubmit}
                    className="w-full bg-gray-900 text-white hover:bg-gray-800"
                    disabled={loading || !level}
                >
                    {loading ? 'Submitting...' : 'Continue to Dashboard'}
                </Button>
            </div>
        </AuthShell>
    );
}
