const fs = require('fs');
let code = fs.readFileSync('src/components/Home/ZeyroWhatWeDo.tsx', 'utf-8');

// Add useEffect to activeStep
code = code.replace(
  'const [activeStep, setActiveStep] = useState(0);',
  'const [activeStep, setActiveStep] = useState(0);\n\n  useEffect(() => {\n    const timer = setInterval(() => {\n      setActiveStep(s => (s + 1) % 4);\n    }, 6000);\n    return () => clearInterval(timer);\n  }, []);'
);

// Remove onMouseEnter and onClick from stations
code = code.replace(/onMouseEnter=\{\(\) => setActiveStep\(\d\)\}/g, '');
code = code.replace(/onClick=\{\(\) => setActiveStep\(\d\)\}/g, '');

// Remove cursor-pointer hover:scale-105 from stations
code = code.replace(/cursor-pointer transition-transform hover:scale-105/g, 'transition-transform');
code = code.replace(/cursor-pointer transition-opacity duration-300/g, 'transition-opacity duration-300');

// Remove local AnimatePresence blocks
code = code.replace(/<AnimatePresence>\s*\{activeStep === \d && \([\s\S]*?<\/motion\.div>\s*\)\}\s*<\/AnimatePresence>/g, '');

// For the global packet, we'll replace the Desktop track
const desktopTrack = `                    {/* Absolute Continuous Pipeline Track */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-[40px] right-[40px] h-[3px] flex z-0">
                      <div className="w-[66.66%] h-full bg-slate-300" />
                      <div className="w-[33.33%] h-full border-t-[3px] border-dashed border-slate-300" />
                      
                      {/* Global Data Packet */}
                      <motion.div
                        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center -ml-2 -mt-2 w-4 h-4 z-10"
                        initial={false}
                        animate={{ left: \`\${(activeStep / 3) * 100}%\` }}
                        transition={{ duration: activeStep === 0 ? 0 : 3, ease: "easeInOut" }}
                      >
                        <AnimatePresence mode="wait">
                          {activeStep <= 1 ? (
                            <motion.div 
                              key="cluster" 
                              exit={{ opacity: 0, scale: 0 }} 
                              className="grid grid-cols-2 gap-[2px] items-center justify-center w-3 h-3"
                            >
                               <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                               <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                               <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            </motion.div>
                          ) : (
                            <motion.div 
                              key="triangle" 
                              initial={{ opacity: 0, scale: 0, rotate: -90 }} 
                              animate={{ opacity: 1, scale: 1, rotate: 90 }} 
                              exit={{ opacity: 0, scale: 0, rotate: 180 }}
                              className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-slate-400" 
                            />
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </div>`;

code = code.replace(/\{\/\* Absolute Continuous Pipeline Track \*\/\}[\s\S]*?<\/div>\s*<\/div>/, desktopTrack);

// And for the mobile track
const mobileTrack = `                  {/* Absolute Continuous Vertical Pipeline Track */}
                  <div className="absolute top-[40px] bottom-[40px] left-[46px] w-[3px] flex flex-col z-0">
                    <div className="h-[66.66%] w-full bg-slate-300" />
                    <div className="h-[33.33%] w-full border-l-[3px] border-dashed border-slate-300" />
                    
                    {/* Global Data Packet */}
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center -mt-2 -ml-2 w-4 h-4 z-10"
                      initial={false}
                      animate={{ top: \`\${(activeStep / 3) * 100}%\` }}
                      transition={{ duration: activeStep === 0 ? 0 : 3, ease: "easeInOut" }}
                    >
                      <AnimatePresence mode="wait">
                        {activeStep <= 1 ? (
                          <motion.div 
                            key="cluster" 
                            exit={{ opacity: 0, scale: 0 }} 
                            className="grid grid-cols-2 gap-[2px] items-center justify-center w-3 h-3"
                          >
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                             <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="triangle" 
                            initial={{ opacity: 0, scale: 0, rotate: 0 }} 
                            animate={{ opacity: 1, scale: 1, rotate: 180 }} 
                            exit={{ opacity: 0, scale: 0, rotate: 270 }}
                            className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-slate-400" 
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>`;

code = code.replace(/\{\/\* Absolute Continuous Vertical Pipeline Track \*\/\}[\s\S]*?<\/div>\s*<\/div>/, mobileTrack);

fs.writeFileSync('src/components/Home/ZeyroWhatWeDo.tsx', code);
