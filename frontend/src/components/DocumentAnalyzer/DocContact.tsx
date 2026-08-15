"use client";

import React, { useState, useRef, useEffect } from 'react';

const quotes = [
  {
    text: (
      <>
        The accuracy, especially on tables, is meaningfully better than anything we tested. We evaluated over 15 solutions and Zeyro was the only one that worked reliably.
      </>
    ),
    role: "Head of AI",
    company: "Fortune 150 Bank, NY"
  },
  {
    text: "Mortgage servicing documents are extremely complex, but Zeyro was the only system that parsed them with high accuracy. Confidence scoring and flagging reduced hours of manual review for our team.",
    role: "CEO",
    company: "Large Mortgage Servicer"
  },
  {
    text: "Zeyro handled edge cases that consistently broke other systems, particularly the ones around nested tables and different formats.",
    role: "CTO",
    company: "Series A fintech"
  }
];

export default function DocContact() {
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('in');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const goToNext = React.useCallback(() => {
    setFadeState('out');
    setTimeout(() => {
      setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
      setFadeState('in');
    }, 700);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(goToNext, 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [goToNext]);

  const handleNextQuote = () => {
    if (fadeState === 'out') return; // Prevent rapid clicking issues
    if (timerRef.current) clearInterval(timerRef.current);
    goToNext();
    timerRef.current = setInterval(goToNext, 6000);
  };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    description: '',
    volume: '',
    source: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > 5) {
      setErrors(prev => ({ ...prev, files: 'Maximum 5 files allowed.' }));
      return;
    }
    const totalSize = [...files, ...newFiles].reduce((acc, file) => acc + file.size, 0);
    if (totalSize > 35 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, files: 'Maximum total size is 35MB.' }));
      return;
    }
    setFiles(prev => [...prev, ...newFiles]);
    setErrors(prev => ({ ...prev, files: '' }));
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    setFormData({ fullName: '', email: '', company: '', description: '', volume: '', source: '' });
    setFiles([]);
    setTimeout(() => setIsSuccess(false), 5000);
  };

  return (
    <section className="relative font-sans border-b border-gray-200">
      <div className="max-w-[1300px] mx-auto bg-[#f9f9f9] px-6 lg:px-0 py-16 lg:py-20 relative">

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 relative z-10">

          {/* Left Side */}
          <div className="lg:w-[47%] py-4 pl-8 md:pl-12">
            <div>
              <h2 className="text-[40px] md:text-[48px] xl:text-[48px] leading-[1.05] font-medium tracking-tight text-[#111] mb-5">
                See Zeyro AI work on<br />your own documents.
              </h2>
              <p className="text-[16px] text-gray-500 leading-relaxed max-w-lg">
                Tell us a little about your workflow and share a sample document.<br />We'll use it to show you a structured output during the call.
              </p>
            </div>

            <div className="pt-16 lg:pt-20 min-h-[300px]">
              <div className="text-[#a1a1aa] mb-4">
                <svg width="28" height="20" viewBox="0 0 40 30" fill="currentColor"><path d="M11.667 30C5.223 30 0 24.777 0 18.333c0-4.043 2.05-7.592 5.17-9.673l7.997-15.994h7.5L12.5 10.333h1.667C20.61 10.333 25.833 15.557 25.833 22S20.61 30 14.167 30h-2.5zm19.167 0C24.39 30 19.167 24.777 19.167 18.333c0-4.043 2.05-7.592 5.17-9.673l7.997-15.994h7.5L31.667 10.333h1.667C39.777 10.333 45 15.557 45 22S39.777 30 33.333 30h-2.5z" transform="translate(-0 -0)" /></svg>
              </div>
              <div className={`relative transition-opacity duration-700 ease-in-out ${fadeState === 'out' ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-[20px] font-medium text-[#111] leading-snug mb-6 tracking-tight pr-6">
                  {quotes[currentQuoteIndex].text}
                </p>
                <div className="flex justify-between items-end pr-6">
                  <div>
                    <div className="font-semibold text-gray-900 text-[13px] mb-0.5">{quotes[currentQuoteIndex].role}</div>
                    <div className="text-gray-500 text-[13px]">{quotes[currentQuoteIndex].company}</div>
                  </div>
                  <button
                    onClick={handleNextQuote}
                    className="text-[10px] font-mono tracking-wider text-gray-800 hover:text-black cursor-pointer uppercase"
                  >
                    NEXT →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side (Form) */}
          <div className="lg:w-[50%] pr-8 md:pr-12">
            <div className="border border-gray-200 p-8 md:p-10 bg-white relative overflow-hidden">
              {isSuccess && (
                <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center text-center p-8 backdrop-blur-sm transition-all duration-300">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h3 className="text-2xl font-semibold mb-2">Request Received</h3>
                  <p className="text-gray-500">We'll be in touch shortly to schedule your demo.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Field 1 */}
                <div>
                  <label className="flex items-center gap-[10px] mb-[6px] text-[14px] font-medium text-gray-900">
                    <span className="w-[22px] h-[22px] flex items-center justify-center border border-gray-200 text-[11.5px] font-semibold text-black font-mono">1</span>
                    Full name <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Jane Doe" className={`w-full border p-3 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 ${errors.fullName ? 'border-red-500' : 'border-gray-200'}`} />
                  {errors.fullName && <p className="text-red-500 text-[11px] mt-1.5">{errors.fullName}</p>}
                </div>

                {/* Field 2 */}
                <div>
                  <label className="flex items-center gap-[10px] mb-[6px] text-[14px] font-medium text-gray-900">
                    <span className="w-[22px] h-[22px] flex items-center justify-center border border-gray-200 text-[11.5px] font-semibold text-black font-mono">2</span>
                    Email address <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" className={`w-full border p-3 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 ${errors.email ? 'border-red-500' : 'border-gray-200'}`} />
                  {errors.email && <p className="text-red-500 text-[11px] mt-1.5">{errors.email}</p>}
                </div>

                {/* Field 3 */}
                <div>
                  <label className="flex items-center gap-[10px] mb-[6px] text-[14px] font-medium text-gray-900">
                    <span className="w-[22px] h-[22px] flex items-center justify-center border border-gray-200 text-[11.5px] font-semibold text-black font-mono">3</span>
                    Company name
                  </label>
                  <input type="text" name="company" value={formData.company} onChange={handleInputChange} placeholder="Acme Inc." className="w-full border border-gray-200 p-3 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400" />
                </div>

                {/* Field 4 */}
                <div>
                  <label className="flex items-center gap-[10px] mb-[6px] text-[14px] font-medium text-gray-900">
                    <span className="w-[22px] h-[22px] flex items-center justify-center border border-gray-200 text-[11.5px] font-semibold text-black font-mono">4</span>
                    Describe how we can help
                  </label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Tell us a bit about your use case and the documents you're working with." rows={3} className="w-full border border-gray-200 p-3 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 resize-none" />
                </div>

                {/* Field 5 */}
                <div>
                  <label className="flex items-center gap-[10px] mb-[6px] text-[14px] font-medium text-gray-900">
                    <span className="w-[22px] h-[22px] flex items-center justify-center border border-gray-200 text-[11.5px] font-semibold text-black font-mono">5</span>
                    What's your monthly page volume?
                  </label>
                  <div className="relative">
                    <select name="volume" value={formData.volume} onChange={handleInputChange} className="w-full border border-gray-200 p-3 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 bg-white appearance-none cursor-pointer pr-8">
                      <option value="">Select an option</option>
                      <option value="under_10k">Under 10,000</option>
                      <option value="10k_100k">10,000 - 100,000</option>
                      <option value="100k_1m">100,000 - 1,000,000</option>
                      <option value="over_1m">Over 1,000,000</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Field 6 */}
                <div>
                  <label className="flex items-center gap-[10px] mb-[6px] text-[14px] font-medium text-gray-900">
                    <span className="w-[22px] h-[22px] flex items-center justify-center border border-gray-200 text-[11.5px] font-semibold text-black font-mono">6</span>
                    How did you hear about us?
                  </label>
                  <div className="relative">
                    <select name="source" value={formData.source} onChange={handleInputChange} className="w-full border border-gray-200 p-3 text-[14px] text-gray-900 focus:outline-none focus:border-gray-400 bg-white appearance-none cursor-pointer pr-8">
                      <option value="">Select an option</option>
                      <option value="Google Search">Google Search</option>
                      <option value="ChatGPT / LLM answer">ChatGPT / LLM answer</option>
                      <option value="LinkedIn / X">LinkedIn / X</option>
                      <option value="Word of mouth">Word of mouth</option>
                      <option value="Conference or event">Conference or event</option>
                      <option value="Documentation">Documentation</option>
                      <option value="Press or media">Press or media</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Field 7 (Upload) */}
                <div>
                  <label className="flex items-center gap-[10px] mb-[6px] text-[14px] font-medium text-gray-900">
                    <span className="w-[22px] h-[22px] flex items-center justify-center border border-gray-200 text-[11.5px] font-semibold text-black font-mono">7</span>
                    Give us your toughest document set (optional)
                  </label>
                  <p className="text-[12px] text-gray-500 mb-3">
                    Upload sample files you'd like us to run through Zeyro. We'll use them to show you a sample structured output once we meet.
                  </p>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full border border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDragging ? 'border-gray-500 bg-gray-50' : 'border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                    <div className="text-[13px] text-gray-800 mb-1.5">Click to upload or drag and drop (up to 35 MB total, 5 files)</div>
                    <div className="text-[11px] text-gray-400">PDFs, images, Excel, Word, or ZIP files welcome. Remove sensitive data if needed.</div>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,.doc,.docx,.zip"
                    />
                  </div>

                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {files.map((file, i) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 border border-gray-200 text-[12px]">
                          <span className="truncate text-gray-700 max-w-[80%]">{file.name}</span>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.files && <p className="text-red-500 text-[11px] mt-1.5">{errors.files}</p>}
                </div>

                {/* Submit Button */}
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#666] hover:bg-[#555] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-white font-medium py-[10px] text-[13px] mt-6 flex justify-center items-center">
                  {isSubmitting ? (
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : (
                    'Book a demo'
                  )}
                </button>

              </form>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
