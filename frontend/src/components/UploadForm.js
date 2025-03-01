import React, { useState, useRef } from 'react';
import './UploadForm.css';  
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const UploadForm = () => {
    const [files, setFiles] = useState([]);
    const [ageBracket, setAgeBracket] = useState('0-1');
    const [disease, setDisease] = useState('');
    const [dummyOption, setDummyOption] = useState('');
    const [output, setOutput] = useState('');
    const [status, setStatus] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const resultRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
    };

    const handleAgeChange = (e) => {
        setAgeBracket(e.target.value);
    };

    const handleDiseaseChange = (e) => {
        setDisease(e.target.value);
    };

    const handleDummyOptionChange = (e) => {
        setDummyOption(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (files.length === 0) {
            setStatus('Please select at least one image file');
            return;
        }
        
        setIsUploading(true);
        setStep(1);
        setStatus('Uploading files...');
        
        const formData = new FormData();
        for (const file of files) {
            formData.append('productImage', file);
        }
        formData.append('ageBracket', ageBracket);
        formData.append('disease', disease);
        formData.append('dummyOption', dummyOption);

        // Simulate step progression with delays between each step
        // In a real app, these would happen in response to actual processing events
        setTimeout(() => {
            setStep(2);
            setStatus('Processing image classification...');
            
            setTimeout(() => {
                setStep(3);
                setStatus('Analyzing ingredients with Gemini...');
                
                setTimeout(() => {
                    // Assuming here you'd actually fetch from your API
                    fetch('http://localhost:5000/upload', {
                        method: 'POST',
                        body: formData
                    })
                    .then(response => response.json())
                    .then(data => {
                        setStep(4);
                        setStatus('Analysis complete!');
                        setOutput(formatOutput(data.analysis));
                        
                        setTimeout(() => {
                            setIsUploading(false);
                        }, 1000);
                    })
                    .catch(error => {
                        setStatus('Error uploading images. Please try again.');
                        setOutput('');
                        setIsUploading(false);
                        console.error('Error:', error);
                    });
                }, 3000);
            }, 3000);
        }, 3000);
    };

    const handleDownloadPDF = async () => {
        if (!resultRef.current || !output) return;
        
        setIsDownloading(true);
        
        try {
            // Temporarily add print-specific styles
            const style = document.createElement('style');
            style.innerHTML = `
                @media print {
                    .analysis-result { font-family: 'Inter', sans-serif; }
                    .result-section { page-break-inside: avoid; margin-bottom: 15px; }
                    .highlight-warning, .highlight-positive { -webkit-print-color-adjust: exact; }
                }`;
            document.head.appendChild(style);
            
            const resultElement = resultRef.current;
            const canvas = await html2canvas(resultElement, {
                scale: 2,
                useCORS: true,
                logging: false
            });
            
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            
            const imgWidth = 210 - 40; // A4 width (210mm) minus margins
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Add title
            pdf.setFontSize(16);
            pdf.setTextColor(79, 70, 229); // Primary color
            pdf.text('Food Analysis Results', 105, 20, { align: 'center' });
            
            // Add date
            pdf.setFontSize(10);
            pdf.setTextColor(100, 116, 139); // Light text color
            const date = new Date().toLocaleDateString();
            pdf.text(`Generated on: ${date}`, 105, 27, { align: 'center' });
            
            // Add user inputs
            pdf.setFontSize(11);
            pdf.setTextColor(30, 41, 59); // Dark color
            pdf.text(`Age Bracket: ${ageBracket} years`, 20, 40);
            pdf.text(`Health Condition: ${disease || 'None specified'}`, 20, 47);
            
            // Add separator line
            pdf.setDrawColor(226, 232, 240); // Border color
            pdf.line(20, 54, 190, 54);
            
            // Add image of results
            pdf.addImage(imgData, 'PNG', 20, 60, imgWidth, imgHeight);
            
            // Add footer
            pdf.setFontSize(9);
            pdf.setTextColor(100, 116, 139);
            pdf.text('Food Recommendation System for Toddlers', 105, 287, { align: 'center' });
            
            pdf.save('food-analysis-results.pdf');
            
            // Remove temporary style
            document.head.removeChild(style);
        } catch (error) {
            console.error('Error generating PDF:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    const getProgressWidth = () => {
        return `${step * 25}%`;
    };

    return (
        <div className="container">
            <div className="upload-form">
                <h1>Food Recommendation System for Toddlers</h1>
                <p className="subtitle">Upload food product images to get personalized recommendations</p>
                
                <div className="card">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="productImage">
                                <span className="label-text">Upload Product Images</span>
                                <span className="label-hint">Select multiple files if needed</span>
                            </label>
                            <div className="file-input-container">
                                <input 
                                    type="file" 
                                    id="productImage" 
                                    multiple 
                                    onChange={handleFileChange} 
                                    className="file-input"
                                />
                                <div className="file-input-label">
                                    {files.length > 0 ? `${files.length} file(s) selected` : 'Choose files...'}
                                </div>
                                <span className="file-input-button">Browse</span>
                            </div>
                            {files.length > 0 && (
                                <div className="selected-files">
                                    {Array.from(files).map((file, index) => (
                                        <div key={index} className="file-chip">
                                            {file.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="ageBracket">
                                <span className="label-text">Age Bracket</span>
                            </label>
                            <select 
                                id="ageBracket" 
                                value={ageBracket} 
                                onChange={handleAgeChange}
                                className="select-input"
                            >
                                <option value="0-1">0-1 years</option>
                                <option value="1-2">1-2 years</option>
                                <option value="2-3">2-3 years</option>
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="disease">
                                <span className="label-text">Any Chronic or Acute Diseases</span>
                            </label>
                            <input 
                                type="text" 
                                id="disease" 
                                value={disease} 
                                onChange={handleDiseaseChange} 
                                placeholder="E.g., Allergies, Jaundice, etc."
                                className="text-input"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="dummyOption">
                                <span className="label-text">Additional Health Information</span>
                                <span className="label-hint">Optional</span>
                            </label>
                            <input 
                                type="text" 
                                id="dummyOption" 
                                value={dummyOption} 
                                onChange={handleDummyOptionChange} 
                                placeholder="Enter any additional health details"
                                className="text-input"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            className="submit-button" 
                            disabled={isUploading}
                        >
                            {isUploading ? 'Processing...' : 'Analyze Food Product'}
                        </button>
                    </form>
                </div>
                
                {status && (
                    <div className="status-container">
                        <div className="progress-container">
                            <div className="progress-label">
                                {status}
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{width: getProgressWidth()}}
                                ></div>
                            </div>
                            <div className="progress-steps">
                                <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
                                <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
                                <div className={`step ${step >= 3 ? 'active' : ''}`}>3</div>
                                <div className={`step ${step >= 4 ? 'active' : ''}`}>4</div>
                            </div>
                        </div>
                    </div>
                )}
                
                {isUploading && (
                    <div className="scanning-container">
                        <div className={`step-bg step-bg-1 ${step >= 1 ? 'active' : ''}`}></div>
                        <div className={`step-bg step-bg-2 ${step >= 2 ? 'active' : ''}`}></div>
                        <div className={`step-bg step-bg-3 ${step >= 3 ? 'active' : ''}`}></div>
                        <div className={`step-bg step-bg-4 ${step >= 4 ? 'active' : ''}`}></div>
                        
                        <div className="scanning-line"></div>
                        
                        <div className="processing-dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                        
                        <div className={`step-text ${step === 1 ? 'active' : ''}`}>
                            Uploading Images...
                        </div>
                        <div className={`step-text ${step === 2 ? 'active' : ''}`}>
                            Classifying Food Product...
                        </div>
                        <div className={`step-text ${step === 3 ? 'active' : ''}`}>
                            Analyzing with Gemini AI...
                        </div>
                        <div className={`step-text ${step === 4 ? 'active' : ''}`}>
                            Generating Recommendations...
                        </div>
                        
                        <div className="scanning-text">
                            {step === 1 && "Securing connection and transmitting data..."}
                            {step === 2 && "Running image recognition algorithms..."}
                            {step === 3 && "Consulting nutritional database..."}
                            {step === 4 && "Finalizing personalized analysis..."}
                        </div>
                    </div>
                )}
                
                {output && (
                    <div className="result-card">
                        <div className="result-header">
                            <h2>Analysis Results</h2>
                            <button 
                                className="download-button" 
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                            >
                                <span className="download-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                </span>
                                {isDownloading ? 'Generating PDF...' : 'Download PDF'}
                            </button>
                        </div>
                        <div className="result-content" ref={resultRef}>
                            <div dangerouslySetInnerHTML={{ __html: output }}></div>
                        </div>
                    </div>
                )}
            </div>
            
            <footer className="footer">
                <div className="footer-content">
                    <p className="footer-text">Food Recommendation System for Toddlers</p>
                    <p className="footer-credits">by Himanshu, Isha, Nikhil, Abhay</p>
                </div>
            </footer>
        </div>
    );
};

// Enhanced function to format output with better styling
const formatOutput = (output) => {
    // Replace main headings with styled h3 elements
    let formattedOutput = output
        // Main section headings with custom styling and icons
        .replace(/\*\*(Ingredients Analysis)\*\*/g, 
            '<h3 class="result-heading"><span class="result-icon">🧪</span> $1</h3>')
        .replace(/\*\*(Nutritional Information)\*\*/g, 
            '<h3 class="result-heading"><span class="result-icon">🍎</span> $1</h3>')
        .replace(/\*\*(Considerations for .+?)\*\*/g, 
            '<h3 class="result-heading"><span class="result-icon">👶</span> $1</h3>')
        .replace(/\*\*(Overall Suitability)\*\*/g, 
            '<h3 class="result-heading"><span class="result-icon">✅</span> $1</h3>')
        .replace(/\*\*(Alternatives)\*\*/g, 
            '<h3 class="result-heading"><span class="result-icon">🔄</span> $1</h3>')
        .replace(/\*\*(Important Considerations)\*\*/g, 
            '<h3 class="result-heading"><span class="result-icon">⚠️</span> $1</h3>')
        .replace(/\*\*(In summary)\*\*/g, 
            '<h3 class="result-heading"><span class="result-icon">📝</span> $1</h3>')
        
        // Format sub-headings (assuming they use single asterisks)
        .replace(/\*([\w\s\-\+]+):\*/g, '<h4 class="result-subheading">$1:</h4>')
        
        // Highlight key points, warnings and recommendations
        .replace(/(Not recommended|Caution|Warning|Avoid|High in|Low in)/g, 
            '<span class="highlight-warning">$1</span>')
        .replace(/(Recommended|Beneficial|Good source|Excellent|Suitable)/g, 
            '<span class="highlight-positive">$1</span>')
            
        // Format lists (assuming they use hyphens)
        .replace(/- (.*?)(?=\n|$)/g, '<li class="result-list-item">$1</li>')
        
        // Group lists (convert consecutive list items into proper HTML lists)
        .replace(/(<li class="result-list-item">.*?<\/li>)+/g, function(match) {
            return '<ul class="result-list">' + match + '</ul>';
        })
        
        // Convert newlines to breaks, but not inside lists
        .replace(/\n(?!<ul|<li|<\/ul|<\/li)/g, '<br/>')
        
        // Create info boxes for key sections
        .replace(/<h3 class="result-heading">(.+?)<\/h3>(.*?)(?=<h3 class="result-heading"|$)/gs, 
            '<div class="result-section"><h3 class="result-heading">$1</h3>$2</div>');
    
    // Wrap the entire output in a container
    return `<div class="analysis-result">${formattedOutput}</div>`;
};

export default UploadForm;