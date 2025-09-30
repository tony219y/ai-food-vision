import { useEffect, useState } from "react";
import { MAX_SIZE_MB } from "../config/constants";
import api from "../services/api";

export const useImageUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any | null>(null);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleFile = async (f: File) => {
        setError(null);
        setResult(null);
        if (!f.type.startsWith("image/")) {
            setError("Please select an image");
            return;
        }
        if (f.size > MAX_SIZE_MB * 1024 * 1024) {
            setError(`File exceeds ${MAX_SIZE_MB}MB`);
            return;
        }
        if (preview) URL.revokeObjectURL(preview);
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const clearFile = () => {
        if (preview) URL.revokeObjectURL(preview);
        setFile(null);
        setPreview(null);
        setError(null);
        setResult(null);
    };

    const analyze = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("uploadInput", file);
            const response = await api.post("/api/v1/upload", formData, {});
            setResult(response.data);
        } catch (err: any) {
            setError(
                err?.response?.data?.detail ||
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setIsAnalyzing(false);
        }
    };

    return {
        file,
        preview,
        error,
        isAnalyzing,
        result,
        handleFile,
        clearFile,
        analyze,
    };
}