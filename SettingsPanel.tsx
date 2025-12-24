import React from 'react';
import { GenerationSettings, Tone, Length, Intent } from '../types';
import { TONE_OPTIONS, LENGTH_OPTIONS, INTENT_OPTIONS } from '../constants';

interface SettingsPanelProps {
  settings: GenerationSettings;
  onChange: (s: GenerationSettings) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
  const update = (key: keyof GenerationSettings, value: any) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6 pb-6">
      
      {/* Spicy Mode Toggle - Visual Enhancement */}
      <div 
        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300
        ${settings.spicyMode 
          ? 'bg-gradient-to-r from-orange-900/40 to-pink-900/40 border-orange-500/40 shadow-lg shadow-orange-900/20' 
          : 'bg-zinc-800/50 border-zinc-700'}`}
      >
        <div>
          <label className={`text-base font-bold flex items-center gap-2 ${settings.spicyMode ? 'text-orange-100' : 'text-zinc-300'}`}>
            Spicy Mode {settings.spicyMode ? '🔥' : '🌶️'}
          </label>
          <p className={`text-xs mt-0.5 ${settings.spicyMode ? 'text-orange-200/80' : 'text-zinc-500'}`}>
            {settings.spicyMode ? 'Maximize confidence & flirtiness.' : 'Standard friendly tone.'}
          </p>
        </div>
        <button
          onClick={() => update('spicyMode', !settings.spicyMode)}
          className={`w-14 h-8 rounded-full transition-all relative focus:outline-none ring-2 ring-offset-2 ring-offset-zinc-900
            ${settings.spicyMode ? 'bg-gradient-to-r from-orange-500 to-pink-500 ring-orange-500' : 'bg-zinc-700 ring-transparent'}`}
        >
          <span
            className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm flex items-center justify-center text-[10px]
              ${settings.spicyMode ? 'translate-x-6' : 'translate-x-0'}`}
          >
             {settings.spicyMode ? '🔥' : ''}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tone */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Vibe</label>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map(t => (
              <button
                key={t}
                onClick={() => update('tone', t)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all border
                  ${settings.tone === t 
                    ? 'bg-zinc-100 text-zinc-900 border-zinc-100 font-medium' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Intent */}
        <div>
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Goal</label>
          <select
            value={settings.intent}
            onChange={(e) => update('intent', e.target.value as Intent)}
            className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
          >
            {INTENT_OPTIONS.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Length */}
      <div>
        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Length</label>
        <div className="flex bg-zinc-800 p-1 rounded-lg border border-zinc-700">
          {LENGTH_OPTIONS.map(l => (
            <button
              key={l}
              onClick={() => update('length', l)}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all
                ${settings.length === l
                  ? 'bg-zinc-600 text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Boldness Slider */}
      <div>
        <div className="flex justify-between mb-2">
          <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Risk Level</label>
          <span className="text-xs text-zinc-400">{Math.round(settings.boldness * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.boldness}
          onChange={(e) => update('boldness', parseFloat(e.target.value))}
          className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer
             ${settings.spicyMode ? 'accent-orange-500 bg-orange-900/30' : 'accent-indigo-500 bg-zinc-800'}`}
        />
        <div className="flex justify-between mt-1">
             <span className="text-[10px] text-zinc-600">Safe</span>
             <span className="text-[10px] text-zinc-600">Bold</span>
        </div>
      </div>

    </div>
  );
};

export default SettingsPanel;