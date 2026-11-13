import re

with open('frontend/index.html', encoding='utf-8') as f:
    html = f.read()

# 1. Default chronoCaseMode to 'arena'
html = html.replace("let chronoCaseMode = 'story';", "let chronoCaseMode = 'arena';")

# 2. Update initial button classes
old_btns = '''                <button onclick="switchCaseMode('story')" id="btn-mode-story" class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2">
                  <img src="assets/icons/badge_detective.webp" class="w-5 h-5 object-contain rounded inline-block" onerror="if(window.ICON_ASSETS)this.src=window.ICON_ASSETS.badge_detective">
                  <span>案卷破案主线</span>
                  <span class="px-1.5 py-0.5 rounded-md bg-slate-950/20 text-slate-900 text-[10px] font-bold">6 大侦破剧本</span>
                </button>
                <button onclick="switchCaseMode('arena')" id="btn-mode-arena" class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-amber-400/50 transition flex items-center justify-center gap-2">
                  <img src="assets/icons/badge_arena.webp" class="w-5 h-5 object-contain rounded inline-block" onerror="if(window.ICON_ASSETS)this.src=window.ICON_ASSETS.badge_arena">
                  <span>分级真题特训靶场</span>
                  <span class="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">600 题特训</span>
                </button>'''

new_btns = '''                <button onclick="switchCaseMode('arena')" id="btn-mode-arena" class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2">
                  <img src="assets/icons/badge_arena.webp" class="w-5 h-5 object-contain rounded inline-block" onerror="if(window.ICON_ASSETS)this.src=window.ICON_ASSETS.badge_arena">
                  <span>⚡ 分级真题特训靶场</span>
                  <span class="px-2 py-0.5 rounded-md bg-slate-950/30 text-slate-950 text-[11px] font-black animate-pulse">600 题海量特训</span>
                </button>
                <button onclick="switchCaseMode('story')" id="btn-mode-story" class="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-400/50 transition flex items-center justify-center gap-2">
                  <img src="assets/icons/badge_detective.webp" class="w-5 h-5 object-contain rounded inline-block" onerror="if(window.ICON_ASSETS)this.src=window.ICON_ASSETS.badge_detective">
                  <span>🕵️ 侦探剧情剧本杀</span>
                  <span class="px-1.5 py-0.5 rounded-md bg-slate-700 text-slate-300 text-[10px] font-bold">6 案卷</span>
                </button>'''

assert old_btns in html, "old_btns not found"
html = html.replace(old_btns, new_btns)

# 3. Swap container hidden classes
old_containers = '''            <!-- ================= MODE A: 案卷破案主线容器 ================= -->
            <div id="case-story-container" class="space-y-4">'''

new_containers = '''            <!-- ================= MODE A: 案卷破案主线容器 ================= -->
            <div id="case-story-container" class="hidden space-y-4">
              <!-- 快捷引导横幅 -->
              <div class="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                <div class="flex items-center gap-2 text-amber-300 font-bold">
                  <span class="text-base">⚡</span>
                  <span>当前处于【侦探剧本杀剧情模式】。若需要 600 道 4-5 年级及小升初/初中真题刷题与名师解析：</span>
                </div>
                <button onclick="switchCaseMode('arena')" class="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 active:scale-95 transition flex items-center gap-1 flex-shrink-0">
                  <span>进入 600 题特训靶场 ➔</span>
                </button>
              </div>'''

assert old_containers in html, "old_containers not found"
html = html.replace(old_containers, new_containers)

old_arena_container = '''            <!-- ================= MODE B: 分级真题特训靶场容器 ================= -->
            <div id="case-arena-container" class="hidden space-y-4">'''

new_arena_container = '''            <!-- ================= MODE B: 分级真题特训靶场容器 ================= -->
            <div id="case-arena-container" class="space-y-4">'''

assert old_arena_container in html, "old_arena_container not found"
html = html.replace(old_arena_container, new_arena_container)

# 4. In switchCaseMode logic:
# Ensure classes match the new button order & styling
old_switch_logic = '''      if (mode === 'story') {
        storyCont.classList.remove('hidden');
        arenaCont.classList.add('hidden');
        btnStory.className = 'flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2';
        btnArena.className = 'flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-amber-400/50 transition flex items-center justify-center gap-2';
        renderChronoCaseSelector();
        switchChronoCase(currentActiveCaseId);
      } else {
        storyCont.classList.add('hidden');
        arenaCont.classList.remove('hidden');
        btnStory.className = 'flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-400/50 transition flex items-center justify-center gap-2';
        btnArena.className = 'flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2';
        renderArenaMatrix();
        renderCurrentArenaQuestion();
      }'''

new_switch_logic = '''      if (mode === 'story') {
        storyCont.classList.remove('hidden');
        arenaCont.classList.add('hidden');
        btnStory.className = 'flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2';
        btnArena.className = 'flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-amber-400/50 transition flex items-center justify-center gap-2';
        renderChronoCaseSelector();
        switchChronoCase(currentActiveCaseId);
      } else {
        storyCont.classList.add('hidden');
        arenaCont.classList.remove('hidden');
        btnStory.className = 'flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:border-cyan-400/50 transition flex items-center justify-center gap-2';
        btnArena.className = 'flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2';
        renderArenaMatrix();
        renderCurrentArenaQuestion();
      }'''

assert old_switch_logic in html, "old_switch_logic not found"
html = html.replace(old_switch_logic, new_switch_logic)

# 5. In DOMContentLoaded, call switchCaseMode('arena')
old_dom_ready = '''    window.addEventListener('DOMContentLoaded', () => {
      loadWorkspaceData();
      renderChronoRound();'''

new_dom_ready = '''    window.addEventListener('DOMContentLoaded', () => {
      loadWorkspaceData();
      renderChronoRound();
      switchCaseMode('arena');'''

assert old_dom_ready in html, "old_dom_ready not found"
html = html.replace(old_dom_ready, new_dom_ready)

# 6. In switchTab, if switching to cases, ensure arena renders
old_switch_tab = '''      if (targetView) targetView.classList.remove('hidden');'''
new_switch_tab = '''      if (targetView) {
        targetView.classList.remove('hidden');
        if (tabId === 'cases') {
          switchCaseMode(chronoCaseMode);
        }
      }'''

assert old_switch_tab in html, "old_switch_tab not found"
html = html.replace(old_switch_tab, new_switch_tab)

with open('frontend/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Applied: Arena 600-question mode is now the DEFAULT view for 时空破案!")
