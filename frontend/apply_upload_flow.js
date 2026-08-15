const fs = require('fs');

// --- 1. PATCH page.tsx ---
let pagePath = 'd:/zbiz-web/src/app/bfs-dashboard/page.tsx';
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Add addSystemMessage
const handleSendMessageEnd = "  };\n\n  const handleLogout =";
const addSystemMessageCode = `  };

  const addSystemMessage = (text: string, customElement?: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now() + Math.random(),
      sender: 'Zeyro Copilot',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAgent: true,
      customElement
    }]);
  };

  const handleLogout =`;
pageContent = pageContent.replace(handleSendMessageEnd, addSystemMessageCode);

// Pass to AgentWorkspaceView
const workspaceViewTarget = `              handleSendMessage={handleSendMessage}
            />`;
const workspaceViewReplacement = `              handleSendMessage={handleSendMessage}
              addSystemMessage={addSystemMessage}
            />`;
pageContent = pageContent.replace(workspaceViewTarget, workspaceViewReplacement);

fs.writeFileSync(pagePath, pageContent, 'utf8');


// --- 2. PATCH agentWorkspaceView.tsx ---
let workspacePath = 'd:/zbiz-web/src/app/bfs-dashboard/agentWorkspaceView.tsx';
let workspaceContent = fs.readFileSync(workspacePath, 'utf8');

// Add to props interface
const propsTarget = `  handleSendMessage: () => void;
}`;
const propsReplacement = `  handleSendMessage: () => void;
  addSystemMessage: (text: string, customElement?: string) => void;
}`;
workspaceContent = workspaceContent.replace(propsTarget, propsReplacement);

// Destructure from props
const destructureTarget = `  setInputVal,
  handleSendMessage
}) => {`;
const destructureReplacement = `  setInputVal,
  handleSendMessage,
  addSystemMessage
}) => {`;
workspaceContent = workspaceContent.replace(destructureTarget, destructureReplacement);

// Pass to CashflowInputView
const inputViewTarget = `{input.formType === 'cashflow' && (
            <CashflowInputView />
          )}`;
const inputViewReplacement = `{input.formType === 'cashflow' && (
            <CashflowInputView onSimulateProcess={addSystemMessage} />
          )}`;
workspaceContent = workspaceContent.replace(inputViewTarget, inputViewReplacement);

// Render custom element in chat
const chatTarget = `                    {msg.text}
                  </div>
                </div>`;
const chatReplacement = `                    {msg.text}
                  </div>
                  {msg.customElement === 'view_output_card' && (
                    <div className="mt-2 border border-gray-200 bg-white shadow-sm rounded-lg p-3 w-full max-w-[280px]">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-[10px]">✓</span>
                        </div>
                        <span className="text-[11px] text-gray-800 font-semibold">Ready for Review</span>
                      </div>
                      <button onClick={() => setActiveSection('OUTPUT')} className="bg-gray-900 text-white w-full py-1.5 rounded-md text-[10px] font-medium hover:bg-gray-800 transition-colors border border-gray-700">
                        View Output Data
                      </button>
                    </div>
                  )}
                </div>`;
workspaceContent = workspaceContent.replace(chatTarget, chatReplacement);

fs.writeFileSync(workspacePath, workspaceContent, 'utf8');

console.log('Patched page.tsx and agentWorkspaceView.tsx');
