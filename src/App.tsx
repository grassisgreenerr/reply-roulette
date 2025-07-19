import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice1, Dice2, Dice3, Sparkles, Copy, Shuffle } from 'lucide-react';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

interface Reply {
  type: 'conversation' | 'curiosity' | 'chaos';
  text: string;
  icon: React.ReactNode;
  color: string;
}

function App() {
  const [inputText, setInputText] = useState('');
  const [replies, setReplies] = useState<Reply[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateReplies = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setReplies([]);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompts = [
        {
          type: 'conversation' as const,
          prompt: `You are a clever reply sniper — trained to respond to any online post in ways that spark conversation, curiosity, or chaos.

Given this post, generate a witty reply that feels natural and real. Avoid tryhard emojis or cringe corporate tone.

Post: "${inputText}"

Output only the reply text, no JSON formatting.`,
          icon: <Dice1 className="w-6 h-6" />,
          color: 'from-purple-500 to-pink-500'
        },
        {
          type: 'curiosity' as const,
          prompt: `You are a clever reply sniper — trained to respond to any online post in ways that spark conversation, curiosity, or chaos.

Given this post, generate a thoughtful reply that makes people curious and want to engage more. Keep it natural and fast, not corporate.

Post: "${inputText}"

Output only the reply text, no JSON formatting.`,
          icon: <Dice2 className="w-6 h-6" />,
          color: 'from-green-400 to-emerald-500'
        },
        {
          type: 'chaos' as const,
          prompt: `You are a clever reply sniper — trained to respond to any online post in ways that spark conversation, curiosity, or chaos.

Given this post, generate a reply with viral bait potential that could stir up reactions. Be bold but feel real, avoid cringe.

Post: "${inputText}"

Output only the reply text, no JSON formatting.`,
          icon: <Dice3 className="w-6 h-6" />,
          color: 'from-yellow-400 to-orange-500'
        }
      ];

      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        const result = await model.generateContent(prompt.prompt);
        const response = await result.response;
        const text = response.text();
        
        setReplies(prev => [...prev, {
          type: prompt.type,
          text: text.trim(),
          icon: prompt.icon,
          color: prompt.color
        }]);
        
        // Add delay between generations for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 800));
      }
    } catch (error) {
      console.error('Error generating replies:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const reset = () => {
    setInputText('');
    setReplies([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden cursor-poker-chip">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-16 h-24 bg-gradient-to-b from-purple-400 to-purple-600 rounded-lg shadow-lg opacity-10"
            initial={{ x: -100, y: Math.random() * window.innerHeight, rotate: 0 }}
            animate={{ 
              x: window.innerWidth + 100, 
              rotate: 360,
              y: Math.random() * window.innerHeight 
            }}
            transition={{ 
              duration: 15 + Math.random() * 10, 
              repeat: Infinity, 
              delay: i * 2,
              ease: "linear" 
            }}
            style={{ 
              clipPath: 'polygon(10% 0%, 90% 0%, 95% 25%, 85% 100%, 15% 100%, 5% 25%)'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-green-400 mb-4 tracking-tight">
            REPLY ROULETTE
          </h1>
          <p className="text-xl text-purple-200 font-medium">
            Roll the dice on witty replies • Conversation • Curiosity • Chaos
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div 
          className="max-w-4xl mx-auto mb-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-purple-500/30 p-8 shadow-2xl">
            <label htmlFor="tweet-input" className="block text-lg font-semibold text-purple-200 mb-4">
              Paste your tweet or post:
            </label>
            <textarea
              id="tweet-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste any tweet, post, or thread here..."
              className="w-full h-32 bg-purple-900/50 border border-purple-400/30 rounded-xl px-4 py-3 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none text-lg"
            />
            <div className="flex gap-4 mt-6">
              <motion.button
                onClick={generateReplies}
                disabled={!inputText.trim() || isGenerating}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6" />
                    </motion.div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Shuffle className="w-6 h-6" />
                    Roll the Dice
                  </>
                )}
              </motion.button>
              
              <motion.button
                onClick={reset}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reset
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <AnimatePresence>
          {replies.length > 0 && (
            <motion.div 
              className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {replies.map((reply, index) => (
                <motion.div
                  key={index}
                  className="bg-black/40 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 shadow-2xl group hover:shadow-3xl transition-all duration-500"
                  initial={{ opacity: 0, y: 50, rotateY: 180 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl bg-gradient-to-r ${reply.color} text-white`}>
                    {reply.icon}
                    <span className="font-bold text-lg capitalize">
                      {reply.type === 'conversation' ? 'Witty' : 
                       reply.type === 'curiosity' ? 'Thoughtful' : 
                       'Viral Bait'}
                    </span>
                  </div>
                  
                  <p className="text-purple-100 text-lg leading-relaxed mb-6 min-h-[120px]">
                    {reply.text}
                  </p>
                  
                  <motion.button
                    onClick={() => copyToClipboard(reply.text, index)}
                    className="w-full bg-purple-600/50 hover:bg-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-purple-400/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Copy className="w-4 h-4" />
                    {copiedIndex === index ? 'Copied!' : 'Copy Reply'}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Cards */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(3)].map((_, index) => (
                <motion.div
                  key={index}
                  className="bg-black/40 backdrop-blur-md rounded-2xl border border-purple-500/30 p-6 shadow-2xl"
                  initial={{ opacity: 0, rotateY: 180 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="flex items-center justify-center h-48">
                    <motion.div
                      className="w-16 h-24 bg-gradient-to-b from-purple-400 to-purple-600 rounded-lg shadow-lg"
                      animate={{ 
                        rotateY: [0, 180, 360],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: index * 0.3 
                      }}
                      style={{ 
                        clipPath: 'polygon(10% 0%, 90% 0%, 95% 25%, 85% 100%, 15% 100%, 5% 25%)'
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;