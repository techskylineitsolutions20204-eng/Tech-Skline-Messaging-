import React, { useState } from 'react';
import { Phone, MessageSquare, Delete } from 'lucide-react';

interface KeypadProps {
  onCall: (number: string) => void;
  onMessage: (number: string) => void;
}

const KEYS = [
  { val: '1', sub: '' },
  { val: '2', sub: 'ABC' },
  { val: '3', sub: 'DEF' },
  { val: '4', sub: 'GHI' },
  { val: '5', sub: 'JKL' },
  { val: '6', sub: 'MNO' },
  { val: '7', sub: 'PQRS' },
  { val: '8', sub: 'TUV' },
  { val: '9', sub: 'WXYZ' },
  { val: '*', sub: '' },
  { val: '0', sub: '+' },
  { val: '#', sub: '' },
];

const Keypad: React.FC<KeypadProps> = ({ onCall, onMessage }) => {
  const [input, setInput] = useState('');

  const handlePress = (val: string) => {
    if (input.length < 15) setInput(prev => prev + val);
  };

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1));
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
       {/* Background Pattern */}
       <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>

       <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-xl p-8 rounded-[3rem] border border-slate-800 shadow-2xl relative z-10">
           
           {/* Display */}
           <div className="mb-8 h-20 flex items-center justify-center relative w-full border-b border-slate-700/50">
              <span className={`font-mono text-white tracking-wider transition-all ${input.length > 10 ? 'text-2xl' : 'text-4xl'}`}>
                {input || <span className="text-slate-600 text-2xl">...</span>}
              </span>
              {input && (
                <button
                  onClick={handleDelete}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 hover:text-red-400 p-2 transition-colors"
                >
                  <Delete className="w-6 h-6" />
                </button>
              )}
           </div>

           {/* Grid */}
           <div className="grid grid-cols-3 gap-y-6 gap-x-8 mb-10 mx-auto w-fit">
              {KEYS.map((k) => (
                <button
                  key={k.val}
                  onClick={() => handlePress(k.val)}
                  className="w-16 h-16 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-cyan-900 active:scale-95 transition-all flex flex-col items-center justify-center border border-slate-700 shadow-lg group select-none relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-2xl font-medium text-white group-hover:text-cyan-400 transition-colors">{k.val}</span>
                  {k.sub && <span className="text-[9px] text-slate-500 font-bold tracking-[0.1em] mt-0.5">{k.sub}</span>}
                </button>
              ))}
           </div>

           {/* Actions */}
           <div className="flex gap-8 justify-center items-center mt-4">
              <button
                onClick={() => onMessage(input)}
                disabled={!input}
                className={`flex flex-col items-center gap-2 group transition-all duration-300 ${!input ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-100'}`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all bg-indigo-600 group-hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 group-active:scale-95`}>
                    <MessageSquare className="w-6 h-6" />
                </div>
              </button>
              
              <button
                onClick={() => onCall(input)}
                disabled={!input}
                className={`flex flex-col items-center gap-2 group transition-all duration-300 ${!input ? 'opacity-30 grayscale cursor-not-allowed' : 'opacity-100'}`}
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all bg-emerald-500 group-hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/30 group-active:scale-95`}>
                    <Phone className="w-8 h-8" />
                </div>
              </button>
           </div>
       </div>
    </div>
  );
};

export default Keypad;