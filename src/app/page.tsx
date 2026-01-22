'use client';

import { useState, useEffect } from 'react';
import { libraries, disciplines, icons } from '@/lib/data';
import { personalizePrompt, simpleMarkdown } from '@/lib/utils';

type Step = 'landing' | 'brand-input' | 'discipline-select' | 'library-view' | 'llm-output';
type Mode = 'strategy' | 'execution';
type Provider = 'gemini' | 'openai' | 'anthropic' | 'none';

interface State {
  step: Step;
  mode: Mode;
  brand: string;
  website: string;
  industry: string;
  challenge: string;
  discipline: string | null;
  library: any | null;
  expandedModels: Record<number, boolean>;
  expandedPrompts: Record<number, boolean>;
  copiedId: number | string | null;
  selectedPrompt: any | null;
  llmOutput: string;
  isLoading: boolean;
  apiKey: string;
  llmProvider: Provider;
  freePromptsUsed: number;
}

const FREE_PROMPT_LIMIT = 15;

export default function Home() {
  const [state, setState] = useState<State>({
    step: 'landing',
    mode: 'strategy',
    brand: '',
    website: '',
    industry: '',
    challenge: '',
    discipline: null,
    library: null,
    expandedModels: {},
    expandedPrompts: {},
    copiedId: null,
    selectedPrompt: null,
    llmOutput: '',
    isLoading: false,
    apiKey: '',
    llmProvider: 'gemini',
    freePromptsUsed: 0,
  });

  // Load saved state from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('amplify_api_key') || '';
    const savedProvider = (localStorage.getItem('amplify_provider') as Provider) || 'gemini';
    const savedPromptsUsed = parseInt(localStorage.getItem('amplify_free_prompts_used') || '0', 10);

    setState(prev => ({
      ...prev,
      apiKey: savedApiKey,
      llmProvider: savedProvider,
      freePromptsUsed: savedPromptsUsed,
    }));
  }, []);

  const updateState = (updates: Partial<State>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const copyToClipboard = (text: string, id: number | string) => {
    navigator.clipboard.writeText(text).then(() => {
      updateState({ copiedId: id });
      setTimeout(() => updateState({ copiedId: null }), 2000);
    });
  };

  const copyLLMOutput = (id: string) => {
    const isNoApiKey = state.llmOutput.startsWith('__NO_API_KEY__');
    const content = isNoApiKey ? state.llmOutput.replace('__NO_API_KEY__\n\n', '') : state.llmOutput;
    copyToClipboard(content, id);
  };

  const setMode = (mode: Mode) => {
    updateState({ mode });
  };

  const setProvider = (provider: Provider) => {
    updateState({ llmProvider: provider });
    localStorage.setItem('amplify_provider', provider);
  };

  const runPromptWithLLM = async (prompt: string) => {
    // Check free tier limit if using Gemini (server key)
    if (state.llmProvider === 'gemini' && state.freePromptsUsed >= FREE_PROMPT_LIMIT) {
      updateState({
        step: 'llm-output',
        llmOutput: `__LIMIT_REACHED__\n\nYou've used all ${FREE_PROMPT_LIMIT} free prompts this month.\n\nTo continue:\n1. Add your own API key (OpenAI or Anthropic)\n2. Upgrade to Premium for unlimited prompts`,
        isLoading: false,
      });
      return;
    }

    updateState({ isLoading: true, llmOutput: '', step: 'llm-output' });

    const personalizedPrompt = personalizePrompt(prompt, state);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: personalizedPrompt,
          mode: state.mode,
          provider: state.llmProvider,
          userApiKey: state.llmProvider !== 'gemini' ? state.apiKey : undefined,
        }),
      });

      const data = await response.json();

      if (data.error) {
        updateState({ llmOutput: `Error: ${data.error}`, isLoading: false });
      } else {
        // Track free tier usage
        if (state.llmProvider === 'gemini') {
          const newCount = state.freePromptsUsed + 1;
          localStorage.setItem('amplify_free_prompts_used', newCount.toString());
          updateState({ freePromptsUsed: newCount });
        }
        updateState({ llmOutput: data.result, isLoading: false });
      }
    } catch (error: any) {
      updateState({ llmOutput: `Error: ${error.message}`, isLoading: false });
    }
  };

  const switchModeAndRerun = (newMode: Mode) => {
    if (state.mode !== newMode && state.selectedPrompt) {
      updateState({ mode: newMode });
      runPromptWithLLM(state.selectedPrompt.prompt);
    }
  };

  const submitBrandInfo = () => {
    const brand = (document.getElementById('brand') as HTMLInputElement)?.value || '';
    const website = (document.getElementById('website') as HTMLInputElement)?.value || '';
    const industry = (document.getElementById('industry') as HTMLInputElement)?.value || '';
    const challenge = (document.getElementById('challenge') as HTMLTextAreaElement)?.value || '';
    const apiKeyInput = (document.getElementById('apiKey') as HTMLInputElement)?.value || '';

    if (!brand || !industry || !challenge) {
      alert('Please fill in Brand, Industry, and Challenge fields');
      return;
    }

    if (state.llmProvider !== 'gemini' && state.llmProvider !== 'none') {
      localStorage.setItem('amplify_api_key', apiKeyInput);
    }

    updateState({
      brand,
      website,
      industry,
      challenge,
      apiKey: apiKeyInput,
      step: 'discipline-select',
    });
  };

  const selectDiscipline = (value: string) => {
    updateState({
      discipline: value,
      library: libraries[value as keyof typeof libraries],
      expandedModels: {},
      expandedPrompts: {},
      step: 'library-view',
    });
  };

  const toggleModel = (index: number) => {
    updateState({
      expandedModels: {
        ...state.expandedModels,
        [index]: !state.expandedModels[index],
      },
    });
  };

  const togglePrompt = (index: number) => {
    updateState({
      expandedPrompts: {
        ...state.expandedPrompts,
        [index]: !state.expandedPrompts[index],
      },
    });
  };

  const runPrompt = (index: number) => {
    const prompt = state.library.prompts[index];
    updateState({ selectedPrompt: prompt });
    runPromptWithLLM(prompt.prompt);
  };

  const goBack = (step: Step) => {
    updateState({ step });
  };

  const resetAll = () => {
    updateState({
      step: 'landing',
      discipline: null,
      library: null,
      expandedModels: {},
      expandedPrompts: {},
      llmOutput: '',
      selectedPrompt: null,
    });
  };

  // Render components based on step
  return (
    <>
      {state.step !== 'landing' && (
        <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={resetAll}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                  <span dangerouslySetInnerHTML={{ __html: icons.sparkles }} />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Amplify</h1>
                  <p className="text-xs text-slate-400">AI-powered marketing</p>
                </div>
              </div>
              {state.llmProvider === 'gemini' && (
                <div className="text-xs text-slate-500">
                  {state.freePromptsUsed}/{FREE_PROMPT_LIMIT} free prompts
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      <main className={`max-w-6xl mx-auto px-4 ${state.step !== 'landing' ? 'py-8' : 'py-4'}`}>
        {state.step === 'landing' && <LandingPage onStart={() => updateState({ step: 'brand-input' })} />}
        {state.step === 'brand-input' && (
          <BrandInput
            state={state}
            setProvider={setProvider}
            submitBrandInfo={submitBrandInfo}
          />
        )}
        {state.step === 'discipline-select' && (
          <DisciplineSelect
            state={state}
            selectDiscipline={selectDiscipline}
            goBack={() => goBack('brand-input')}
          />
        )}
        {state.step === 'library-view' && (
          <LibraryView
            state={state}
            setMode={setMode}
            toggleModel={toggleModel}
            togglePrompt={togglePrompt}
            runPrompt={runPrompt}
            copyToClipboard={copyToClipboard}
            goBack={() => goBack('discipline-select')}
          />
        )}
        {state.step === 'llm-output' && (
          <LLMOutput
            state={state}
            copyLLMOutput={copyLLMOutput}
            switchModeAndRerun={switchModeAndRerun}
            goBack={() => goBack('library-view')}
          />
        )}
      </main>

      {state.step !== 'landing' && (
        <footer className="border-t border-slate-800 mt-12 py-6">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <p className="text-sm text-slate-400 mb-2">
              Powered by{' '}
              <a href="https://fabricacollective.com" target="_blank" className="text-purple-400 hover:text-purple-300 transition-colors">
                Fabrica Collective
              </a>
            </p>
            <p className="text-xs text-slate-600">Sources: Reforge, Demand Curve, CXL, HubSpot, Semrush, Growth.Design</p>
          </div>
        </footer>
      )}
    </>
  );
}

// Landing Page Component
function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm mb-8">
          <span dangerouslySetInnerHTML={{ __html: icons.sparkles }} />
          <span>By Fabrica Collective</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-4 max-w-4xl leading-tight">
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Amplify</span>
        </h1>
        <p className="text-2xl md:text-3xl font-semibold text-white mb-3">AI-powered marketing</p>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl">
          Your AI marketing team in a browser — from strategy to send
        </p>

        <p className="text-base text-slate-500 max-w-2xl mb-8 leading-relaxed">
          90 expert prompts across 9 disciplines. Personalized to your brand. Powered by the strategic wisdom of legendary creative minds.
        </p>

        {/* Strategy/Execution Badge */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="inline-flex items-center bg-slate-800 rounded-xl p-1.5 border border-slate-700">
            <div className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium flex items-center gap-2">
              📋 Strategy Mode
            </div>
            <div className="px-4 py-2 rounded-lg text-slate-400 text-sm font-medium flex items-center gap-2">
              ⚡ Execution Mode
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-500 mb-10 max-w-lg mx-auto">
          Toggle between <span className="text-purple-400">Strategy</span> for frameworks & analysis or{' '}
          <span className="text-green-400">Execution</span> for ready-to-use content you can copy and publish immediately
        </p>

        <button
          onClick={onStart}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold text-lg flex items-center gap-3 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
        >
          Get Started — It's Free
          <span dangerouslySetInnerHTML={{ __html: icons.arrowRight }} />
        </button>

        <p className="text-xs text-slate-600 mt-4">15 free prompts/month • No signup required</p>
      </div>

      {/* How It Works */}
      <div className="py-16 border-t border-slate-800">
        <h2 className="text-2xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mx-auto mb-4 text-2xl border border-purple-500/20">1</div>
            <h3 className="font-semibold text-lg mb-2">Add Your Context</h3>
            <p className="text-slate-400 text-sm">Enter your brand, website, industry, and business challenge</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center mx-auto mb-4 text-2xl border border-cyan-500/20">2</div>
            <h3 className="font-semibold text-lg mb-2">Pick a Discipline</h3>
            <p className="text-slate-400 text-sm">Choose from 9 disciplines: SEO, Email, Social, Blog, and more</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center mx-auto mb-4 text-2xl border border-pink-500/20">3</div>
            <h3 className="font-semibold text-lg mb-2">Choose Your Mode</h3>
            <p className="text-slate-400 text-sm">Strategy for frameworks & planning, or Execution for ready-to-use content</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mx-auto mb-4 text-2xl border border-green-500/20">4</div>
            <h3 className="font-semibold text-lg mb-2">Run or Copy</h3>
            <p className="text-slate-400 text-sm">Execute with AI instantly, or copy to your favorite tool</p>
          </div>
        </div>
      </div>

      {/* Landing Footer */}
      <div className="py-8 border-t border-slate-800 text-center">
        <p className="text-sm text-slate-400 mb-2">
          Powered by{' '}
          <a href="https://fabricacollective.com" target="_blank" className="text-purple-400 hover:text-purple-300 transition-colors">
            Fabrica Collective
          </a>
        </p>
        <p className="text-xs text-slate-600">Sources: Reforge, Demand Curve, CXL, HubSpot, Semrush, Growth.Design</p>
      </div>
    </div>
  );
}

// Brand Input Component
function BrandInput({
  state,
  setProvider,
  submitBrandInfo,
}: {
  state: State;
  setProvider: (provider: Provider) => void;
  submitBrandInfo: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Tell us about your business</h2>
        <p className="text-slate-400">We'll personalize every prompt to your specific context</p>
      </div>

      <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Brand Name *</label>
          <input
            type="text"
            id="brand"
            defaultValue={state.brand}
            placeholder="e.g., Acme Inc."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Website</label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500" dangerouslySetInnerHTML={{ __html: icons.globe }} />
            <input
              type="text"
              id="website"
              defaultValue={state.website}
              placeholder="e.g., acme.com"
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Industry / Niche *</label>
          <input
            type="text"
            id="industry"
            defaultValue={state.industry}
            placeholder="e.g., B2B SaaS, E-commerce, Healthcare"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Business Challenge *</label>
          <textarea
            id="challenge"
            rows={3}
            defaultValue={state.challenge}
            placeholder="e.g., We need to increase organic traffic by 50% in Q1 to reduce CAC..."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 resize-none"
          />
          <p className="text-xs text-slate-500 mt-2">Be specific—this context makes the prompts 10x more useful</p>
        </div>

        <div className="pt-4 border-t border-slate-700">
          <label className="block text-sm font-medium text-slate-300 mb-2">AI Provider</label>
          <div className="flex gap-3 mb-3">
            <button
              onClick={() => setProvider('gemini')}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                state.llmProvider === 'gemini'
                  ? 'border-green-500 bg-green-500/20 text-green-300'
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              Gemini (Free)
            </button>
            <button
              onClick={() => setProvider('openai')}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                state.llmProvider === 'openai'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              OpenAI
            </button>
            <button
              onClick={() => setProvider('anthropic')}
              className={`flex-1 px-4 py-2 rounded-lg border ${
                state.llmProvider === 'anthropic'
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-slate-600 text-slate-400 hover:border-slate-500'
              }`}
            >
              Anthropic
            </button>
          </div>
          {state.llmProvider === 'gemini' ? (
            <p className="text-xs text-green-400">✓ {15 - state.freePromptsUsed} free prompts remaining this month</p>
          ) : (
            <>
              <input
                type="password"
                id="apiKey"
                defaultValue={state.apiKey}
                placeholder={state.llmProvider === 'openai' ? 'sk-...' : 'sk-ant-...'}
                className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <p className="text-xs text-slate-500 mt-2">Stored locally in your browser only</p>
            </>
          )}
        </div>

        <button
          onClick={submitBrandInfo}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
        >
          Continue to Prompt Library
          <span dangerouslySetInnerHTML={{ __html: icons.arrowRight }} />
        </button>
      </div>
    </div>
  );
}

// Discipline Select Component
function DisciplineSelect({
  state,
  selectDiscipline,
  goBack,
}: {
  state: State;
  selectDiscipline: (value: string) => void;
  goBack: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm mb-4">
          <span className="font-medium">{state.brand}</span>
          <span className="text-slate-500">•</span>
          <span>{state.industry}</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">Choose Your Marketing Focus</h2>
        <p className="text-slate-400">Select a discipline to get personalized prompts for {state.brand}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {disciplines.map((d) => (
          <button
            key={d.value}
            onClick={() => selectDiscipline(d.value)}
            className="p-6 rounded-xl border-2 transition-all text-left border-slate-700 bg-slate-800 hover:border-purple-500 hover:bg-slate-700 group"
          >
            <div className="text-3xl mb-3">{d.icon}</div>
            <div className="font-semibold text-lg mb-1 group-hover:text-purple-300">{d.label}</div>
            <div className="text-sm text-slate-400">{d.desc}</div>
          </button>
        ))}
      </div>

      <button
        onClick={goBack}
        className="mt-8 mx-auto flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} />
        Edit business info
      </button>
    </div>
  );
}

// Library View Component
function LibraryView({
  state,
  setMode,
  toggleModel,
  togglePrompt,
  runPrompt,
  copyToClipboard,
  goBack,
}: {
  state: State;
  setMode: (mode: Mode) => void;
  toggleModel: (index: number) => void;
  togglePrompt: (index: number) => void;
  runPrompt: (index: number) => void;
  copyToClipboard: (text: string, id: number | string) => void;
  goBack: () => void;
}) {
  const lib = state.library;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} /> Back
        </button>
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
          <span className="font-medium">{state.brand}</span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
          <button
            onClick={() => setMode('strategy')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
              state.mode === 'strategy' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            📋 Strategy
          </button>
          <button
            onClick={() => setMode('execution')}
            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${
              state.mode === 'execution' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Execution
          </button>
        </div>
      </div>
      <p className="text-center text-sm text-slate-500">
        {state.mode === 'strategy'
          ? 'Get frameworks, analysis, and strategic recommendations'
          : 'Get ready-to-use content you can copy and publish immediately'}
      </p>

      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">{lib.title}</h2>
        <p className="text-slate-400 leading-relaxed">{lib.summary}</p>
      </div>

      {/* Mental Models */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400">
            <span dangerouslySetInnerHTML={{ __html: icons.brain }} />
          </div>
          <h3 className="text-xl font-bold">Mental Models</h3>
          <span className="text-sm text-slate-500">({lib.mentalModels.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lib.mentalModels.map((model: any, index: number) => (
            <MentalModelCard
              key={index}
              model={model}
              index={index}
              isOpen={state.expandedModels[index]}
              onToggle={() => toggleModel(index)}
            />
          ))}
        </div>
      </section>

      {/* Prompts */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-600/20 flex items-center justify-center text-cyan-400">
            <span dangerouslySetInnerHTML={{ __html: icons.zap }} />
          </div>
          <h3 className="text-xl font-bold">Personalized Prompts</h3>
          <span className="text-sm text-slate-500">(10)</span>
        </div>
        <div className="space-y-4">
          {lib.prompts.map((prompt: any, index: number) => (
            <PromptCard
              key={index}
              prompt={prompt}
              index={index}
              state={state}
              isExpanded={state.expandedPrompts[index]}
              isCopied={state.copiedId === prompt.id}
              onToggle={() => togglePrompt(index)}
              onRun={() => runPrompt(index)}
              onCopy={(text) => copyToClipboard(text, prompt.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

// Mental Model Card
function MentalModelCard({
  model,
  index,
  isOpen,
  onToggle,
}: {
  model: any;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-start justify-between cursor-pointer" onClick={onToggle}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0 text-purple-400">
            <span dangerouslySetInnerHTML={{ __html: icons.brain }} />
          </div>
          <div>
            <h4 className="font-semibold text-white">{model.name}</h4>
            <p className="text-sm text-slate-400 mt-1">{model.description}</p>
          </div>
        </div>
        <button className="text-slate-500 hover:text-slate-300">
          <span dangerouslySetInnerHTML={{ __html: isOpen ? icons.chevronUp : icons.chevronDown }} />
        </button>
      </div>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-700 space-y-3">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 mt-1" dangerouslySetInnerHTML={{ __html: icons.lightbulb }} />
            <p className="text-sm text-slate-300">{model.lesson}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span dangerouslySetInnerHTML={{ __html: icons.book }} />
            <span>{model.source}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Prompt Card
function PromptCard({
  prompt,
  index,
  state,
  isExpanded,
  isCopied,
  onToggle,
  onRun,
  onCopy,
}: {
  prompt: any;
  index: number;
  state: State;
  isExpanded: boolean;
  isCopied: boolean;
  onToggle: () => void;
  onRun: () => void;
  onCopy: (text: string) => void;
}) {
  const personalized = personalizePrompt(prompt.prompt, state);
  const displayText = isExpanded ? personalized : personalized.length > 180 ? personalized.slice(0, 180) + '...' : personalized;

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0 font-bold text-white">
              {prompt.id}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wide">Prompt {prompt.id}</span>
              </div>
              <h4 className="font-semibold text-white mt-1">{prompt.goal}</h4>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onCopy(personalized)}
              className={`p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors ${isCopied ? 'text-green-400' : 'text-slate-400'}`}
              title="Copy prompt"
            >
              <span dangerouslySetInnerHTML={{ __html: isCopied ? icons.check : icons.copy }} />
            </button>
            <button
              onClick={onRun}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white text-sm font-medium flex items-center gap-1 transition-all"
              title="Run with AI"
            >
              <span dangerouslySetInnerHTML={{ __html: icons.play }} /> Run
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-slate-900 rounded-lg">
          <p className="text-sm text-slate-300 font-mono leading-relaxed">{displayText}</p>
          {personalized.length > 180 && (
            <button onClick={onToggle} className="text-xs text-cyan-400 hover:text-cyan-300 mt-2 flex items-center gap-1">
              {isExpanded ? 'Show less' : 'Show more'}
              <span dangerouslySetInnerHTML={{ __html: isExpanded ? icons.chevronUp : icons.chevronDown }} />
            </button>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-purple-400 mb-2">
              <span dangerouslySetInnerHTML={{ __html: icons.target }} /> Why this fits
            </div>
            <p className="text-xs text-slate-400">{prompt.whyFits}</p>
          </div>
          <div className="p-3 bg-slate-900/50 rounded-lg">
            <div className="flex items-center gap-2 text-xs font-medium text-green-400 mb-2">
              <span dangerouslySetInnerHTML={{ __html: icons.zap }} /> How to use it
            </div>
            <p className="text-xs text-slate-400">{prompt.howUsed}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// LLM Output Component
function LLMOutput({
  state,
  copyLLMOutput,
  switchModeAndRerun,
  goBack,
}: {
  state: State;
  copyLLMOutput: (id: string) => void;
  switchModeAndRerun: (mode: Mode) => void;
  goBack: () => void;
}) {
  const isNoApiKey = state.llmOutput.startsWith('__NO_API_KEY__');
  const isLimitReached = state.llmOutput.startsWith('__LIMIT_REACHED__');
  const content = isNoApiKey
    ? state.llmOutput.replace('__NO_API_KEY__\n\n', '')
    : isLimitReached
    ? state.llmOutput.replace('__LIMIT_REACHED__\n\n', '')
    : state.llmOutput;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={goBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <span dangerouslySetInnerHTML={{ __html: icons.arrowLeft }} /> Back to Prompts
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => copyLLMOutput('output')}
            className={`px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm flex items-center gap-2 transition-colors ${
              state.copiedId === 'output' ? 'text-green-400' : ''
            }`}
          >
            <span dangerouslySetInnerHTML={{ __html: state.copiedId === 'output' ? icons.check : icons.copy }} />
            Copy
          </button>
        </div>
      </div>

      {state.selectedPrompt && (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Prompt Used</div>
              <div className="text-sm text-slate-300">{state.selectedPrompt.goal}</div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-700">
            <div className="inline-flex items-center bg-slate-900 rounded-lg p-1">
              <button
                onClick={() => switchModeAndRerun('strategy')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  state.mode === 'strategy' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                📋 Strategy
              </button>
              <button
                onClick={() => switchModeAndRerun('execution')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  state.mode === 'execution' ? 'bg-green-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Execution
              </button>
            </div>
            <span className="text-xs text-slate-500">Switch mode to regenerate</span>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span dangerouslySetInnerHTML={{ __html: icons.sparkles }} />
            <span className="font-medium">{isNoApiKey || isLimitReached ? 'Notice' : 'AI Response'}</span>
          </div>
          {state.isLoading && (
            <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <div className="p-6">
          {state.isLoading ? (
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span>Generating personalized {state.mode === 'strategy' ? 'strategy' : 'content'} for {state.brand}...</span>
            </div>
          ) : isLimitReached ? (
            <div className="space-y-4 text-center">
              <p className="text-yellow-400 text-lg">Free limit reached</p>
              <p className="text-slate-400">{content}</p>
            </div>
          ) : (
            <div className="markdown-output text-slate-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: simpleMarkdown(content) }} />
          )}
        </div>
      </div>
    </div>
  );
}
