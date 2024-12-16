"use client"
import React, { useActionState, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useFormStatus } from 'react-dom';
import VTTDisplay from '../components/VTTDisplay';

interface Word {
    word: string;
    start: number;
    end: number;
}
interface TranscriptionResponse {
    transcription: {
        text: string;
        word_count: number;
        words: Word[];
        vtt: string;
    }
}

// 添加一个新的 SubmitButton 组件
function SubmitButton({ file }: { file: File | null }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={!file || pending}>
            {pending ? "处理中..." : "开始转换"}
        </Button>
    );
}

const AudioTranscriptionApp: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [transcription, setTranscription] = useState<string | null>(null);
    const [vtt, setVtt] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

  

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setTranscription(null);
            setError(null);
        }
    };

    async function handleFileAction(formData: FormData) {

        try {
            const response = await fetch("/api/whisper", {
                method: "POST",
                body: formData, // 将 FormData 直接作为请求体
            })
            const data: TranscriptionResponse = await response.json(); // 解析 JSON 响应
            console.log("data", data)
            setTranscription(data.transcription.text);
            setVtt(data.transcription.vtt);

        } catch (error) {
            setError((error as Error).message)
            console.error("Error generating image:", error)
        }


    }


    return (
        <div className="max-w-md mx-auto p-4">

            <Card>
                <CardHeader>
                    <CardTitle>音频转文字</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleFileAction}>
                        <div className="space-y-4 mb-4">
                            <input
                                type="file"
                                name="audio"
                                accept="audio/*"
                                onChange={handleFileChange}
                                className="w-full p-2 border rounded"
                            />
                            {error && (
                                <div className="text-red-500 bg-red-50 p-2 rounded">
                                    {error}
                                </div>
                            )}
                            {transcription && (
                                <div className="mt-4">
                                    <h3 className="font-semibold mb-2">转录结果：</h3>
                                    <div className="p-2 border rounded bg-gray-50 text-slate-700">
                                        {transcription}
                                    </div>
                                </div>
                            )}
                            {/* 使用新的 VTTDisplay 组件 */}
                            {vtt && <VTTDisplay vttContent={vtt} />}
                        </div>
                        {/* 添加提交按钮 */}
                        <SubmitButton file={file} />         
                    </form>
                </CardContent>
            </Card>

        </div>
    );
};

export default AudioTranscriptionApp;