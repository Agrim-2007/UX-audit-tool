import React, { useState, useEffect } from 'react';
import './App.css';
import Markdown from 'markdown-to-jsx';

function App() {
    const [inputType, setInputType] = useState('url');
    const [url, setUrl] = useState('');
    const [html, setHtml] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState('');

    const handleAnalyze = async () => {
        setLoading(true);
        setFeedback('');
        setCopySuccess('');

        const GEMINI_API_KEY = "AIzaSyDYjbaipSpMBEuZHT6cVbcTCPpWC3NCZZg";
        const input = (inputType === 'url') ? url : html;

        // Clear the input field after capturing
        if (inputType === 'url') {
            setUrl('');
        } else {
            setHtml('');
        }

        const messageText = inputType === 'url'
            ? `Analyze the landing page content at the following URL: ${input}. 
            Provide 3-5 concise but actionable suggestions for improvement, specifically addressing:

            1. **Clarity of Call to Actions (CTAs):** Are the CTAs clear, compelling, and easy to understand? What could be done to make them more effective?
            2. **Visual Hierarchy:** Is the visual hierarchy clear and guiding the user's eye appropriately? Are the most important elements prominent? How could the visual hierarchy be improved?
            3. **Effectiveness of Copy:** Is the headline clear and engaging? Is the body copy concise, persuasive, and easy to read? What specific parts of the copy could be improved for clarity and impact?
            4. **Presence and Strength of Trust Signals:** Are there elements that build trust (e.g., testimonials, security badges, guarantees)? Are they prominent enough? What additional trust signals could be beneficial?

            Format your response in Markdown, using headings and bullet points for clarity.`
            : `Analyze the following HTML snippet of a landing page: ${input}. 
            Provide 3-5 concise but actionable suggestions for improvement, specifically addressing:

            1. **Clarity of Call to Actions (CTAs):** Based on the provided HTML, are the CTAs likely to be clear and effective? What potential issues do you see? How could they be improved in terms of clarity and design?
            2. **Visual Hierarchy:** Based on the structure of the HTML (headings, layout elements), what is your initial assessment of the likely visual hierarchy? Are there any potential issues? How could the HTML structure be improved to enhance visual hierarchy?
            3. **Effectiveness of Copy:** Analyze the text content within the HTML. Is the headline likely to be clear and engaging? Is the body copy concise and persuasive? What specific text elements could be improved for clarity and impact?
            4. **Presence and Strength of Trust Signals:** Based on the HTML, are there any indications of trust signals? Are they likely to be effective? What potential trust signals might be missing?

            Format your response in Markdown, using headings and bullet points for clarity.`;

        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: messageText }]
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to analyze the landing page');
            }

            const data = await response.json();
            setFeedback(data.candidates[0].content.parts[0].text);
        } catch (error) {
            setFeedback(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && !loading) {
                handleAnalyze();
            }
        };

        const inputElement = inputType === 'url'
            ? document.querySelector('.analyze-section input')
            : document.querySelector('.analyze-section textarea');

        if (inputElement) {
            inputElement.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (inputElement) {
                inputElement.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, [inputType, loading, url, html]);

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Landing Page UX Audit Tool</h1>
            </header>

            <main className="app-main">
                {loading && <div className="loading-indicator">Analyzing...</div>}
                {feedback && (
                    <div className="feedback-container markdown-output">
                        <h2>Analysis Feedback:</h2>
                        <Markdown>{feedback}</Markdown>
                    </div>
                )}
                {!feedback && !loading && (
                    <div className="instruction-container">
                        <p className="instruction-text">Choose an input method below and click 'Analyze' to get feedback.</p>
                    </div>
                )}
            </main>

            <footer className="app-footer">
                <div className="input-type-toggle">
                    <button
                        className={inputType === 'url' ? 'active' : ''}
                        onClick={() => setInputType('url')}
                    >
                        Enter URL
                    </button>
                    <button
                        className={inputType === 'html' ? 'active' : ''}
                        onClick={() => setInputType('html')}
                    >
                        Enter HTML
                    </button>
                </div>

                <div className="analyze-section">
                    {inputType === 'url' && (
                        <div className="input-area">
                            <label htmlFor="urlInput">Enter URL:</label>
                            <input
                                type="text"
                                id="urlInput"
                                placeholder="https://www.example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                            />
                        </div>
                    )}
                    {inputType === 'html' && (
                        <div className="input-area">
                            <label htmlFor="htmlInput">Enter HTML Snippet:</label>
                            <textarea
                                id="htmlInput"
                                placeholder="&lt;h1&gt;Welcome!&lt;/h1&gt;..."
                                value={html}
                                onChange={(e) => setHtml(e.target.value)}
                            />
                        </div>
                    )}
                    <button onClick={handleAnalyze} disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
            </footer>
        </div>
    );
}

export default App;
