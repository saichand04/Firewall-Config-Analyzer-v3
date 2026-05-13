import React, { useState, useEffect } from 'react';
import { AnalysisResult } from '../types';
import { analyzeConfig } from '../services/geminiService';
import { SAMPLE_CONFIG } from '../constants';
import Header from './Header';
import FileUpload from './FileUpload';
import ResultsDisplay from './ResultsDisplay';
import SiriWave from './SiriWave';

const newsHighlights = [
  "Global Logistics Firm Crippled by 'LockBit 3.0' Ransomware Attack, Supply Chains Disrupted.",
  "Critical Zero-Day in Widely-Used VPN Service Actively Exploited by State-Sponsored Actors.",
  "Data Breach at Major Healthcare Provider Exposes Millions of Patient Records.",
  "Financial Sector on High Alert After Coordinated Phishing Campaign Targets Banking Credentials.",
  "Researchers Uncover Sophisticated 'CloudManta' Malware Targeting Cloud Infrastructure.",
  "CISA Issues Emergency Directive for Federal Agencies to Patch Critical Vulnerability in Web Servers."
];


const Dashboard: React.FC = () => {
  const [configText, setConfigText] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentNewsItems, setCurrentNewsItems] = useState<string[]>([]);
  const [newsIndex, setNewsIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!isLoading || currentNewsItems.length === 0) return;

    const timeoutDuration = 6000; // 6 seconds for each news highlight

    const timeoutId = setTimeout(() => {
      setIsFading(true); // Start fade out
      setTimeout(() => {
        setNewsIndex(prevIndex => (prevIndex + 1) % currentNewsItems.length);
        setIsFading(false); // Start fade in
      }, 500); // Wait for fade out to complete
    }, timeoutDuration);

    return () => clearTimeout(timeoutId);
  }, [isLoading, newsIndex, currentNewsItems]);


  const handleAnalyze = async (fileContent: string) => {
    setConfigText(fileContent);
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    setCurrentNewsItems([...newsHighlights].sort(() => 0.5 - Math.random()));
    setNewsIndex(0); // Reset quote on new analysis
    try {
      const result = await analyzeConfig(fileContent);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSample = () => {
    handleAnalyze(SAMPLE_CONFIG);
  };

  const handleReset = () => {
    setConfigText('');
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 md:p-8 flex flex-col relative">
        {analysisResult && !isLoading ? (
          <div className="w-full">
            <ResultsDisplay 
              result={analysisResult} 
              configText={configText} 
              onReset={handleReset} 
            />
          </div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center">
            {!isLoading && !error && (
              <FileUpload onAnalyze={handleAnalyze} onUseSample={handleUseSample} />
            )}
            
            {isLoading && (
              <div className="text-center flex flex-col items-center justify-center h-full w-full">
                <div className="flex-grow flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-semibold text-foreground mb-8">Analyzing Configuration...</h2>
                    <p className="text-muted-foreground mb-4">Our AI is reviewing your firewall configuration for issues.</p>
                    <SiriWave />
                </div>
                <div className="w-full absolute bottom-8 left-0 right-0 px-4">
                   {currentNewsItems.length > 0 && (
                     <p className={`text-2xl text-muted-foreground text-center max-w-3xl mx-auto transition-opacity duration-500 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                          {currentNewsItems[newsIndex]}
                      </p>
                   )}
                </div>
              </div>
            )}

            {error && !isLoading && (
              <div className="text-center max-w-2xl">
                <h2 className="text-2xl font-bold text-destructive">Analysis Failed</h2>
                <p className="text-destructive-foreground bg-destructive/80 p-4 rounded-md mt-4">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-6 px-6 py-2 bg-primary hover:bg-primary/90 rounded-md text-primary-foreground font-semibold transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;