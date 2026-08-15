import re

file_path = r'd:\zbiz-web\src\app\bfs-dashboard\agents\transactionenrichment\TransactionEnrichmentAgentUI.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add useChartContextMenu before ENRICHMENT_PROFILES
use_chart_context_menu = '''
export const useChartContextMenu = (onAskZeyro?: (text: string) => void) => {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const closeMenu = () => setContextMenu(null);

  const renderContextMenu = () => (
    <AnimatePresence>
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-40" onClick={closeMenu} onContextMenu={(e) => { e.preventDefault(); closeMenu(); }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl border border-gray-700 py-1 min-w-[140px]"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            <button 
              onClick={() => {
                onAskZeyro?.('Analyze this chart pattern in detail.');
                closeMenu();
              }}
              className="w-full text-left px-3 py-1.5 text-xs font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Ask Zeyro
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return { handleContextMenu, renderContextMenu };
};
'''
content = content.replace('// --- Demo Data ---', use_chart_context_menu + '\n// --- Demo Data ---')

# 2. Update EnrichmentReportsView signature and add Ask Zeyro button
content = content.replace(
    'export const EnrichmentReportsView: React.FC = () => {', 
    'export const EnrichmentReportsView: React.FC<{ onAskZeyro?: (text: string) => void }> = ({ onAskZeyro }) => {'
)

old_buttons = '''          <button className="px-4 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5">
            {selectedProfile ? (
              <>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export Full Dossier
              </>
            ) : (
              'Generate New Report'
            )}
          </button>'''

new_buttons = '''          <div className="flex gap-2">
            {selectedProfile && onAskZeyro && (
              <button 
                onClick={() => onAskZeyro(Analyze the behavioral profile for  in detail.)}
                className="px-4 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1.5 border border-indigo-100"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Ask Zeyro
              </button>
            )}
            <button className="px-4 py-1.5 bg-gray-900 text-white text-[11px] font-semibold rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1.5">
              {selectedProfile ? (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Export Full Dossier
                </>
              ) : (
                'Generate New Report'
              )}
            </button>
          </div>'''
content = content.replace(old_buttons, new_buttons)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated basic context menu and reports view")
