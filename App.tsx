import React, { useState, useEffect, useRef } from 'react';
import { HashRouter } from 'react-router-dom';
import { 
  MessageSquare, Phone, Users, Settings, BarChart3, 
  Send, Search, MoreVertical, Mic, PhoneCall, 
  Video, Paperclip, Smile, Check, CheckCheck, 
  ShieldCheck, Globe, Smartphone, User, Bell, Lock,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Calendar,
  GripHorizontal
} from 'lucide-react';
import { ai, MODEL_CHAT } from './services/gemini';
import { ChatSession, Message, AppView, CallLog } from './types';
import LiveVoice from './components/LiveVoice';
import Dashboard from './components/Dashboard';
import Keypad from './components/Keypad';

const USER_PHONE_NUMBER = "+1-(408)-614-0468";

// --- Mock Data ---
const MOCK_CHATS: ChatSession[] = [
  {
    id: '0',
    name: 'Tech Skyline AI Assistant',
    avatar: 'https://ui-avatars.com/api/?name=AI&background=0891b2&color=fff',
    messages: [
      { id: 'm0', senderId: 'ai', text: `Welcome to Tech Skyline! I am your personal AI assistant. Your line ${USER_PHONE_NUMBER} is active and secured. How can I help you today?`, timestamp: Date.now() - 100000, isAi: true }
    ],
    lastMessage: 'Your line is active and secured.',
    timestamp: Date.now() - 50000,
    isOnline: true,
    type: 'ai'
  },
  {
    id: '1',
    name: 'International Student Group',
    avatar: 'https://picsum.photos/200/200?random=1',
    messages: [
      { id: 'm1', senderId: 'other', text: 'Has anyone applied for the visa extension yet?', timestamp: Date.now() - 300000 },
      { id: 'm2', senderId: 'me', text: 'Yes, I submitted mine yesterday via the portal.', timestamp: Date.now() - 100000 }
    ],
    lastMessage: 'Yes, I submitted mine yesterday...',
    timestamp: Date.now() - 100000,
    isOnline: false,
    type: 'group'
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    avatar: 'https://picsum.photos/200/200?random=2',
    messages: [],
    lastMessage: 'Call me back on my US number.',
    timestamp: Date.now() - 800000,
    isOnline: true,
    type: 'direct'
  }
];

const MOCK_CALLS: CallLog[] = [
  {
    id: 'c1',
    name: 'Mom',
    type: 'audio',
    direction: 'incoming',
    duration: '12m 45s',
    timestamp: Date.now() - 3600000 // 1 hour ago
  },
  {
    id: 'c2',
    name: 'Sarah Jenkins',
    type: 'video',
    direction: 'outgoing',
    duration: '45m 12s',
    timestamp: Date.now() - 86400000 // 1 day ago
  },
  {
    id: 'c3',
    name: 'University Office',
    type: 'audio',
    direction: 'missed',
    duration: '0s',
    timestamp: Date.now() - 172800000 // 2 days ago
  },
  {
    id: 'c4',
    name: 'Tech Support',
    type: 'audio',
    direction: 'incoming',
    duration: '5m 22s',
    timestamp: Date.now() - 259200000 // 3 days ago
  }
];

// --- Settings Component ---
const SettingsView: React.FC = () => (
  <div className="p-8 h-full overflow-y-auto bg-slate-900">
    <h1 className="text-2xl font-bold text-white mb-8">Account Settings</h1>
    
    <div className="max-w-2xl space-y-6">
      {/* Profile Card */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-cyan-400" /> Profile & Identity
        </h2>
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
            TS
          </div>
          <div className="flex-1">
             <label className="text-xs text-slate-400 uppercase tracking-wider">Linked Number</label>
             <div className="text-xl font-mono text-white font-bold flex items-center gap-3">
               {USER_PHONE_NUMBER}
               <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">Verified</span>
             </div>
             <p className="text-sm text-slate-400 mt-1">This number is used for all outgoing calls and messages.</p>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-cyan-400" /> Security & Privacy
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-white font-medium">Anti-Blocking Protocol</div>
                <div className="text-xs text-slate-400">Bypasses VoIP restrictions automatically</div>
              </div>
            </div>
            <div className="w-10 h-6 bg-cyan-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-white font-medium">Global Roaming</div>
                <div className="text-xs text-slate-400">Optimized for international student networks</div>
              </div>
            </div>
            <div className="w-10 h-6 bg-cyan-600 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

       {/* Notifications */}
       <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-cyan-400" /> Notifications
        </h2>
        <div className="space-y-3">
           <div className="flex items-center gap-2 text-slate-300">
             <input type="checkbox" checked readOnly className="rounded border-slate-600 bg-slate-700 text-cyan-500" />
             <span>Incoming Calls</span>
           </div>
           <div className="flex items-center gap-2 text-slate-300">
             <input type="checkbox" checked readOnly className="rounded border-slate-600 bg-slate-700 text-cyan-500" />
             <span>Message Previews</span>
           </div>
           <div className="flex items-center gap-2 text-slate-300">
             <input type="checkbox" checked readOnly className="rounded border-slate-600 bg-slate-700 text-cyan-500" />
             <span>System Status Alerts</span>
           </div>
        </div>
      </div>

    </div>
  </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.CHATS);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(MOCK_CHATS[0].id);
  const [chats, setChats] = useState<ChatSession[]>(MOCK_CHATS);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, selectedChatId, isTyping]);

  const activeChat = chats.find(c => c.id === selectedChatId);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      text: inputText,
      timestamp: Date.now()
    };

    // Update Local State
    setChats(prev => prev.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: newMessage.text,
          timestamp: newMessage.timestamp
        };
      }
      return chat;
    }));

    setInputText('');

    // AI Handler
    if (activeChat?.type === 'ai') {
      setIsTyping(true);
      try {
        const response = await ai.models.generateContent({
          model: MODEL_CHAT,
          contents: [{ role: 'user', parts: [{ text: newMessage.text }] }],
          config: {
            systemInstruction: `You are the Tech Skyline AI Assistant for International Students. 
            The user is using the phone number ${USER_PHONE_NUMBER}.
            Help them with translation, visa questions, study tips, or general conversation.
            Be concise, friendly, and act as a support agent for this calling app.`
          }
        });
        
        const aiText = response.text || "I'm having trouble connecting right now.";
        
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'ai',
          text: aiText,
          timestamp: Date.now(),
          isAi: true
        };

        setChats(prev => prev.map(chat => {
          if (chat.id === selectedChatId) {
            return {
              ...chat,
              messages: [...chat.messages, aiMessage],
              lastMessage: aiText,
              timestamp: aiMessage.timestamp
            };
          }
          return chat;
        }));

      } catch (error) {
        console.error("AI Error:", error);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleDownloadChat = () => {
    if (!activeChat) return;
    const content = JSON.stringify({
      app: "Tech Skyline",
      user_identity: USER_PHONE_NUMBER,
      chat_partner: activeChat.name,
      export_date: new Date().toISOString(),
      messages: activeChat.messages
    }, null, 2);
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeChat.name.replace(/\s+/g, '_')}_${Date.now()}_log.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleStartChatFromCall = (contactName: string) => {
    // Check if chat exists by name
    const existingChat = chats.find(c => c.name === contactName);
    
    if (existingChat) {
      setSelectedChatId(existingChat.id);
    } else {
      // Create new chat
      const newChatId = `chat_${Date.now()}`;
      const newChat: ChatSession = {
        id: newChatId,
        name: contactName,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(contactName)}&background=random`,
        messages: [],
        lastMessage: 'Start of conversation',
        timestamp: Date.now(),
        isOnline: false,
        type: 'direct'
      };
      setChats(prev => [newChat, ...prev]);
      setSelectedChatId(newChatId);
    }
    setActiveView(AppView.CHATS);
  };

  const handleKeypadMessage = (number: string) => {
    handleStartChatFromCall(number);
  };

  const handleKeypadCall = (number: string) => {
    alert(`Dialing ${number}...\n\nConnecting via Global VoIP Gateway.\nCaller ID: ${USER_PHONE_NUMBER}`);
  };

  return (
    <HashRouter>
      <div className="flex h-screen w-full overflow-hidden bg-slate-950">
        
        {/* --- Navigation Sidebar --- */}
        <div className="w-20 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-8 gap-8 z-20">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group cursor-pointer hover:scale-110 transition-transform">
            <span className="text-white font-bold text-xl">TS</span>
            <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 pointer-events-none">
              Tech Skyline
            </div>
          </div>
          
          <nav className="flex flex-col gap-6 w-full items-center">
            <NavButton icon={<MessageSquare />} active={activeView === AppView.CHATS} onClick={() => setActiveView(AppView.CHATS)} label="Chats" />
            <NavButton icon={<Phone />} active={activeView === AppView.CALLS} onClick={() => setActiveView(AppView.CALLS)} label="Calls" />
            <NavButton icon={<GripHorizontal />} active={activeView === AppView.KEYPAD} onClick={() => setActiveView(AppView.KEYPAD)} label="Keypad" />
            <NavButton icon={<Mic />} active={activeView === AppView.LIVE_AI} onClick={() => setActiveView(AppView.LIVE_AI)} label="Live AI" />
            <NavButton icon={<BarChart3 />} active={activeView === AppView.DASHBOARD} onClick={() => setActiveView(AppView.DASHBOARD)} label="Dev Tools" />
          </nav>

          <div className="mt-auto flex flex-col items-center gap-6">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs text-white cursor-help" title={`Logged in as ${USER_PHONE_NUMBER}`}>
               Me
            </div>
            <NavButton icon={<Settings />} active={activeView === AppView.SETTINGS} onClick={() => setActiveView(AppView.SETTINGS)} label="Settings" />
          </div>
        </div>

        {/* --- Main Content Area --- */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Left Panel: Chat List (Visible in Chats/Calls view) */}
          {(activeView === AppView.CHATS || activeView === AppView.CALLS) && (
            <div className="w-80 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col z-10">
              <div className="p-5 border-b border-slate-800">
                <h2 className="text-xl font-bold text-white mb-4">
                  {activeView === AppView.CHATS ? 'Messages' : 'Recent Calls'}
                </h2>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-cyan-400 transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    className="w-full bg-slate-800 text-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {activeView === AppView.CHATS ? (
                  chats.map(chat => (
                    <div 
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-slate-800/80 ${selectedChatId === chat.id ? 'bg-slate-800 border-l-4 border-cyan-500' : 'border-l-4 border-transparent'}`}
                    >
                      <div className="relative">
                        <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover bg-slate-700" />
                        {chat.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>}
                        {chat.type === 'ai' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-slate-900"><span className="text-[8px] font-bold text-white">AI</span></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                          <h3 className="text-slate-200 font-medium truncate">{chat.name}</h3>
                          <span className="text-xs text-slate-500">Now</span>
                        </div>
                        <p className="text-slate-400 text-sm truncate">
                          {chat.type === 'ai' && <span className="text-cyan-400 mr-1">Bot:</span>}
                          {chat.lastMessage}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                   /* Call List View */
                   MOCK_CALLS.map(call => (
                    <div key={call.id} className="border-b border-slate-800/50">
                        <div 
                        onClick={() => setExpandedCallId(expandedCallId === call.id ? null : call.id)}
                        className={`p-4 cursor-pointer hover:bg-slate-800/50 transition-colors ${expandedCallId === call.id ? 'bg-slate-800/80' : ''}`}
                        >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${call.direction === 'missed' ? 'bg-red-500/10 text-red-500' : call.direction === 'incoming' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                     {call.direction === 'incoming' && <PhoneIncoming className="w-4 h-4" />}
                                     {call.direction === 'outgoing' && <PhoneOutgoing className="w-4 h-4" />}
                                     {call.direction === 'missed' && <PhoneMissed className="w-4 h-4" />}
                                </div>
                                <div>
                                     <h3 className="text-slate-200 font-medium text-sm">{call.name}</h3>
                                     <p className="text-xs text-slate-500 capitalize">{call.direction}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-500 mr-1">{new Date(call.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartChatFromCall(call.name);
                                    }}
                                    className="p-1.5 rounded-full bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-400 border border-slate-700 transition-all shadow-sm z-10"
                                    title="Message"
                                >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        </div>
                        
                        {expandedCallId === call.id && (
                        <div className="px-4 pb-4 bg-slate-800/50 border-t border-slate-800/50 animate-in slide-in-from-top-2 duration-200">
                           <div className="grid grid-cols-2 gap-4 py-3">
                              <div className="flex flex-col gap-1">
                                 <span className="text-[10px] text-slate-500 uppercase tracking-wider">Duration</span>
                                 <div className="flex items-center gap-2 text-slate-300 text-sm">
                                    <Clock className="w-3 h-3 text-cyan-500" />
                                    {call.duration}
                                 </div>
                              </div>
                               <div className="flex flex-col gap-1">
                                 <span className="text-[10px] text-slate-500 uppercase tracking-wider">Time</span>
                                 <div className="flex items-center gap-2 text-slate-300 text-sm">
                                    <Calendar className="w-3 h-3 text-cyan-500" />
                                    {new Date(call.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                 </div>
                              </div>
                               <div className="flex flex-col gap-1 col-span-2">
                                 <span className="text-[10px] text-slate-500 uppercase tracking-wider">Type</span>
                                 <div className="flex items-center gap-2 text-slate-300 text-sm">
                                    {call.type === 'video' ? <Video className="w-3 h-3 text-purple-500" /> : <Phone className="w-3 h-3 text-emerald-500" />}
                                    <span className="capitalize">{call.type} Call</span>
                                 </div>
                              </div>
                           </div>
                           <div className="flex gap-2 mt-2">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  alert(`Calling ${call.name}...\n\n(Connecting to global VoIP network...)`);
                                }}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                 <Phone className="w-3 h-3" /> Call Back
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartChatFromCall(call.name);
                                }}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                              >
                                 <MessageSquare className="w-3 h-3" /> Message
                              </button>
                           </div>
                        </div>
                        )}
                    </div>
                   ))
                )}
              </div>
              
              {/* Footer status */}
              <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Connected: {USER_PHONE_NUMBER}
                </div>
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
              </div>
            </div>
          )}

          {/* Right Panel: Dynamic View */}
          <div className="flex-1 bg-slate-950 flex flex-col min-w-0">
            
            {activeView === AppView.LIVE_AI ? (
              <LiveVoice />
            ) : activeView === AppView.KEYPAD ? (
              <Keypad onCall={handleKeypadCall} onMessage={handleKeypadMessage} />
            ) : activeView === AppView.DASHBOARD ? (
              <Dashboard />
            ) : activeView === AppView.SETTINGS ? (
              <SettingsView />
            ) : activeView === AppView.CHATS && activeChat ? (
              /* --- Chat Interface --- */
              <>
                {/* Header */}
                <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6">
                  <div className="flex items-center gap-4">
                    <img src={activeChat.avatar} alt={activeChat.name} className="w-10 h-10 rounded-full bg-slate-700" />
                    <div>
                      <h3 className="text-white font-semibold flex items-center gap-2">
                        {activeChat.name}
                        {activeChat.type === 'ai' && <span className="px-2 py-0.5 rounded-full bg-cyan-900/50 text-cyan-400 text-[10px] border border-cyan-800">ASSISTANT</span>}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        {activeChat.isOnline ? <span className="text-emerald-400">Online</span> : 'Offline'}
                        {activeChat.type !== 'ai' && <span className="text-slate-600">• via Secure Line</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400">
                    <button className="hover:text-cyan-400 transition-colors p-2 hover:bg-slate-800 rounded-full"><PhoneCall className="w-5 h-5" /></button>
                    <button className="hover:text-cyan-400 transition-colors p-2 hover:bg-slate-800 rounded-full"><Video className="w-5 h-5" /></button>
                    <div className="h-6 w-px bg-slate-700 mx-1"></div>
                    <button onClick={handleDownloadChat} className="hover:text-cyan-400 transition-colors p-2 hover:bg-slate-800 rounded-full" title="Export Chat JSON"><MoreVertical className="w-5 h-5" /></button>
                  </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                  <div className="text-center my-4">
                    <span className="bg-slate-800/80 backdrop-blur text-slate-400 text-xs px-3 py-1 rounded-full border border-slate-700">Today</span>
                  </div>
                  
                  {activeChat.messages.map((msg) => {
                    const isMe = msg.senderId === 'me';
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-2xl px-5 py-3 shadow-md ${isMe ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                          {msg.isAi && (
                             <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/50">
                                <span className="text-xs text-cyan-300 font-bold">Tech Skyline AI</span>
                             </div>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-cyan-200' : 'text-slate-500'}`}>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            {isMe && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isTyping && (
                    <div className="flex justify-start">
                       <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 border border-slate-700">
                          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                          <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                       </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-slate-900 border-t border-slate-800">
                  <div className="flex items-center gap-3 bg-slate-800 rounded-full px-4 py-2 border border-slate-700 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all shadow-lg">
                    <button className="text-slate-400 hover:text-cyan-400 transition-colors"><Smile className="w-5 h-5" /></button>
                    <button className="text-slate-400 hover:text-cyan-400 transition-colors"><Paperclip className="w-5 h-5" /></button>
                    <input 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      type="text" 
                      placeholder="Type a message..." 
                      className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-slate-500"
                    />
                    <button 
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className={`p-2 rounded-full transition-all ${inputText.trim() ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:scale-105' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-center mt-2">
                     <span className="text-[10px] text-slate-600">Sending as {USER_PHONE_NUMBER} • Encrypted</span>
                  </div>
                </div>
              </>
            ) : activeView === AppView.CALLS ? (
               /* Empty State for Calls View in Main Area */
               <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-700 animate-pulse">
                    <Phone className="w-10 h-10 text-cyan-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-300 mb-2">Tech Skyline Voice</h3>
                  <p className="text-sm text-slate-500 max-w-md text-center px-4">
                    Select a call from the history to view details or start a new secure call.<br/>
                    All calls are encrypted via <span className="text-cyan-500 font-mono">{USER_PHONE_NUMBER}</span>.
                  </p>
               </div>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-600 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                  <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-700">
                    <Smartphone className="w-10 h-10 text-cyan-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-300 mb-2">Tech Skyline</h3>
                  <p className="text-sm text-slate-500 max-w-md text-center">
                    Secure, high-quality calls and texts for international students.<br/>
                    Your number <span className="text-cyan-500 font-mono">{USER_PHONE_NUMBER}</span> is ready.
                  </p>
               </div>
            )}
          </div>
        </div>
      </div>
    </HashRouter>
  );
};

const NavButton: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void; label: string }> = ({ icon, active, onClick, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1 w-full p-2 transition-all duration-300 relative group ${active ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`p-3 rounded-2xl transition-all duration-300 ${active ? 'bg-slate-800 shadow-inner shadow-cyan-900/50' : 'hover:bg-slate-800/50'}`}>
      {icon}
    </div>
    <span className="text-[10px] font-medium">{label}</span>
    {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-l-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />}
  </button>
);

export default App;