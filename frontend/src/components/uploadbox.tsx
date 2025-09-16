import { useRef, useState, useEffect, useCallback } from "react";

const MAX_SIZE_MB = 10;

export default function UploadBox() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [dragDepth, setDragDepth] = useState(0); // fix flicker with enter/leave counter
    const isDragging = dragDepth > 0;
    const [preview, setPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Revoke preview URL to prevent memory leaks
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const openPicker = () => fileInputRef.current?.click();

    const useFile = (f: File) => {
        setError(null);
        if (!f.type.startsWith("image/")) {
            setError("Please select an image (JPEG/PNG/WebP, etc.)");
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

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) useFile(f);
        e.currentTarget.value = ""; // allow re-selecting same file
    };

    // Drag & drop handlers (with depth counter)
    const onDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragDepth((d) => d + 1);
    }, []);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragDepth((d) => Math.max(0, d - 1));
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragDepth(0);
        const f = e.dataTransfer.files?.[0];
        if (f) useFile(f);
    }, []);

    // Keyboard activation
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
        }
    };

    return (
        <div>
            <h2 className="mb-2 text-base font-semibold text-gray-800">Upload Your Meal</h2>

            <div
                role="button"
                tabIndex={0}
                aria-label="Upload an image by drag & drop or click"
                aria-describedby="upload-help"
                onClick={openPicker}
                onKeyDown={onKeyDown}
                onDragEnter={onDragEnter}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={[
                    "relative w-[826px] h-[428px] rounded-xl flex flex-col justify-center items-center",
                    "border-2 transition",
                    isDragging ? "border-blue-400 bg-gray-200" : "border-gray-600 bg-white",
                    "focus:outline-none focus:ring-4 focus:ring-blue-300/70"
                ].join(" ")}
            >
                {/* Base message (keeps layout stable). Hide visually while dragging. */}
                <div className={`w-[280px] select-none ${isDragging ? "invisible" : ""}`}>
                    <div className="flex flex-col items-center justify-center gap-2 text-gray-600 font-bold text-2xl text-center">
                        <svg
                            data-testid="geist-icon"
                            width={32}
                            height={32}
                            viewBox="0 0 16 16"
                            strokeLinejoin="round"
                            style={{ color: "currentColor" }}
                            aria-hidden="true"
                            className="mb-3"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M14.5 2.5H1.5V9.18933L2.96966 7.71967L3.18933 7.5H3.49999H6.63001H6.93933L6.96966 7.46967L10.4697 3.96967L11.5303 3.96967L14.5 6.93934V2.5ZM8.00066 8.55999L9.53034 10.0897L10.0607 10.62L9.00001 11.6807L8.46968 11.1503L6.31935 9H3.81065L1.53032 11.2803L1.5 11.3106V12.5C1.5 13.0523 1.94772 13.5 2.5 13.5H13.5C14.0523 13.5 14.5 13.0523 14.5 12.5V9.06066L11 5.56066L8.03032 8.53033L8.00066 8.55999ZM4.05312e-06 10.8107V12.5C4.05312e-06 13.8807 1.11929 15 2.5 15H13.5C14.8807 15 16 13.8807 16 12.5V9.56066L16.5607 9L16.0303 8.46967L16 8.43934V2.5V1H14.5H1.5H4.05312e-06V2.5V10.6893L-0.0606689 10.75L4.05312e-06 10.8107Z"
                                fill="currentColor"
                            />
                        </svg>
                        <span>Drag &amp; drop an image here, or click to select</span>
                    </div>
                </div>

                {/* Button (reserve space with invisible while dragging) */}
                <div className={`flex justify-center mt-5 w-[280px] ${isDragging ? "invisible" : ""}`}>
                    <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openPicker(); }}
                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 cursor-pointer"
                    >
                        Upload
                    </button>
                </div>

                {/* Errors (if any) */}
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                {/* Preview */}
                {preview && (
                    <img
                        src={preview}
                        alt={file?.name || "Selected image preview"}
                        className="mt-4 max-h-40 rounded-lg shadow pointer-events-none"
                    />
                )}

                {/* Hidden file input */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={onChange}
                    className="hidden"
                    aria-hidden="true"
                />

                {/* Drag overlay: centered text + highlight ring without blocking drops */}
                {isDragging && (
                    <div className="pointer-events-none absolute inset-0 rounded-xl ring-4 ring-blue-300/70 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 text-gray-700 font-bold text-2xl text-center">
                            <svg
                                data-testid="geist-icon"
                                width={32}
                                height={32}
                                viewBox="0 0 16 16"
                                strokeLinejoin="round"
                                style={{ color: "currentColor" }}
                                aria-hidden="true"
                                className="mb-3"
                            >
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M14.5 6.5V13.5C14.5 14.8807 13.3807 16 12 16H4C2.61929 16 1.5 14.8807 1.5 13.5V1.5V0H3H8H9.08579C9.351 0 9.60536 0.105357 9.79289 0.292893L14.2071 4.70711C14.3946 4.89464 14.5 5.149 14.5 5.41421V6.5ZM13 6.5V13.5C13 14.0523 12.5523 14.5 12 14.5H4C3.44772 14.5 3 14.0523 3 13.5V1.5H8V5V6.5H9.5H13ZM9.5 2.12132V5H12.3787L9.5 2.12132Z"
                                    fill="currentColor"
                                />
                            </svg>
                            
                            <span>Drop your image here</span>
                        </div>
                    </div>
                )}
            </div>

            <p id="upload-help" className="mt-2 text-sm text-gray-500">
                Note: Please upload a clear image of your meal in .jpg or .png format.
            </p>
        </div>
    );
}
