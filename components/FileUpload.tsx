import React, { useState, useCallback, useRef } from 'react';
// Fix: Removed unused icons and fixed import for ClipboardDocumentIcon
import { UploadIcon, PuzzlePieceIcon, ClipboardDocumentIcon } from './icons/Icons';

interface FileUploadProps {
  onAnalyze: (fileContent: string) => void;
  onUseSample: () => void;
}

const SliderCaptcha: React.FC<{ onSolve: () => void }> = ({ onSolve }) => {
    const [value, setValue] = useState(0);
    const [isSolved, setIsSolved] = useState(false);
    const targetValue = 98;
    const tolerance = 2;

    const handleRelease = () => {
        if (isSolved) return;
        if (Math.abs(value - targetValue) <= tolerance) {
            setValue(100); // Snap to end
            setIsSolved(true);
            setTimeout(onSolve, 300);
        } else {
            setValue(0); // Snap back
        }
    };

    const trackFillColor = isSolved ? 'bg-green-500/30' : 'bg-primary/30';
    
    // SVG icons for the slider thumb, URL-encoded for CSS
    const sliderIconDefault = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5' /%3E%3C/svg%3E")`;
    const sliderIconSolved = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008h-.008v-.008Z' /%3E%3C/svg%3E")`;

    return (
        <div className="max-w-sm mx-auto p-4 bg-secondary rounded-lg select-none">
            <style>{`
                .slider-captcha {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    position: absolute;
                    top: 0;
                    left: 0;
                    z-index: 2;
                    cursor: grab;
                }
                .slider-captcha:active { cursor: grabbing; }
                .slider-captcha::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    background-color: hsl(var(--primary));
                    background-image: ${sliderIconDefault};
                    background-repeat: no-repeat;
                    background-position: center;
                    transition: background-color 0.2s;
                }
                .slider-captcha.solved::-webkit-slider-thumb {
                    background-color: #22c55e; /* green-500 */
                    background-image: ${sliderIconSolved};
                }
                .slider-captcha::-moz-range-thumb {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    border: none;
                    background-color: hsl(var(--primary));
                    background-image: ${sliderIconDefault};
                    background-repeat: no-repeat;
                    background-position: center;
                    transition: background-color 0.2s;
                }
                .slider-captcha.solved::-moz-range-thumb {
                    background-color: #22c55e;
                    background-image: ${sliderIconSolved};
                }
            `}</style>
            <p className="text-foreground mb-4 text-center">Slide to prove you're human</p>
            <div className="relative w-full h-12 bg-background/50 rounded-full flex items-center">
                <div
                    className={`absolute top-0 left-0 h-full rounded-full ${trackFillColor}`}
                    style={{ width: `${value}%` }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-10 h-10 border-2 border-dashed border-muted-foreground/50 rounded-md flex items-center justify-center"
                    style={{ right: `2%` }}
                >
                    <PuzzlePieceIcon className={`w-6 h-6 text-muted-foreground/50 ${isSolved && value >= targetValue ? 'text-green-400' : ''}`} />
                </div>
                <span className={`absolute left-1/2 -translate-x-1/2 text-sm font-semibold transition-opacity text-primary ${value > 10 ? 'opacity-0' : 'opacity-100'}`}>
                    Slide me
                </span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    disabled={isSolved}
                    onChange={(e) => setValue(parseInt(e.target.value, 10))}
                    onMouseUp={handleRelease}
                    onTouchEnd={handleRelease}
                    className={`slider-captcha ${isSolved ? 'solved' : ''}`}
                    aria-label="CAPTCHA slider"
                />
            </div>
        </div>
    );
};


const FileUpload: React.FC<FileUploadProps> = ({ onAnalyze, onUseSample }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const [inputType, setInputType] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert("File is too large. Please upload a file smaller than 10MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onAnalyze(text);
    };
    reader.readAsText(file);
  };
  
  const handlePasteAnalyze = () => {
      if(pastedText.trim()){
          onAnalyze(pastedText);
      } else {
          alert("Please paste some configuration text to analyze.")
      }
  }

  return (
    <div className="w-full max-w-2xl p-8 bg-card border border-border rounded-lg shadow-xl text-center">
      <h2 className="text-2xl font-bold mb-2 text-foreground">Provide Configuration</h2>
      <p className="text-muted-foreground mb-6">Choose to upload a file or paste the text directly.</p>

      {!captchaPassed ? (
        <SliderCaptcha onSolve={() => setCaptchaPassed(true)} />
      ) : (
        <>
            <div className="flex justify-center border-b border-border mb-6">
                <button 
                    onClick={() => setInputType('upload')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${inputType === 'upload' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                    <UploadIcon className="w-5 h-5"/>
                    Upload File
                </button>
                <button 
                    onClick={() => setInputType('paste')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${inputType === 'paste' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/50'}`}
                >
                    <ClipboardDocumentIcon className="w-5 h-5"/>
                    Paste Text
                </button>
            </div>
            
            {inputType === 'upload' && (
                <div 
                  onDragEnter={handleDrag} 
                  onDragOver={handleDrag} 
                  onDragLeave={handleDrag} 
                  onDrop={handleDrop} 
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-accent' : 'border-border hover:border-primary/50'}`}
                >
                  <input type="file" ref={fileInputRef} id="file-upload" className="hidden" accept=".txt,.json" onChange={handleFileChange} />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <UploadIcon className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-semibold text-foreground">Drag & drop or click here</p>
                    <p className="text-sm text-muted-foreground">Max file size: 10MB</p>
                  </div>
                </div>
            )}

            {inputType === 'paste' && (
                <div className="flex flex-col items-center">
                    <textarea
                        value={pastedText}
                        onChange={(e) => setPastedText(e.target.value)}
                        placeholder="Paste your firewall configuration here..."
                        className="w-full h-48 p-4 bg-background/50 border border-border rounded-lg text-foreground font-mono text-sm focus:ring-2 focus:ring-ring focus:outline-none transition-colors"
                    />
                    <button 
                        onClick={handlePasteAnalyze} 
                        className="mt-4 px-6 py-2 bg-primary hover:bg-primary/90 rounded-md text-primary-foreground font-semibold transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                        disabled={!pastedText.trim()}
                    >
                       Analyze Configuration
                    </button>
                </div>
            )}

            <div className="mt-6">
                <p className="text-muted-foreground/80 mb-2 text-sm">--- or ---</p>
                <button onClick={onUseSample} className="px-6 py-2 bg-secondary hover:bg-secondary/80 rounded-md text-secondary-foreground font-semibold transition-colors">
                    Use Sample Config
                </button>
            </div>
        </>
      )}
    </div>
  );
};

export default FileUpload;