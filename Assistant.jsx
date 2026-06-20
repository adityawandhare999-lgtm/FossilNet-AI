import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Sparkles, Mic, Volume2, Cpu } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import API_BASE from '../api';

const Assistant = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('query');

  const [selectedModel, setSelectedModel] = useState('qwen2.5:1.5b');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Salutations, researcher. I am the FossilNet Ask AI Core. Ask me anything regarding taxonomic classifications, geochronological layers, or site hotspots (e.g. 'tell me about the Hell Creek T-Rex' or 'what is the Cambrian Explosion?').",
      agent: "Fossil Expert Agent",
      model: "Core System"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clean up typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (urlQuery && urlQuery.trim()) {
      handleSend(urlQuery);
      setSearchParams({});
    }
  }, [urlQuery]);

  const handleSend = async (messageContent = input) => {
    if (!messageContent.trim() || loading || isTyping) return;

    const userMessage = { role: 'user', content: messageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/assistant/`, {
        prompt: messageContent,
        model_name: selectedModel
      });
      const data = response.data;

      if (data.error) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Core AI Error: ${data.error}`,
          agent: "System Lobe",
          model: "Error Log"
        }]);
        return;
      }

      const botContent = Array.isArray(data) ? (data[0]?.generated_text || data[0]?.text) : (data.generated_text || data.text);
      const cleanContent = botContent.replace(/\[INST\].*?\[\/INST\]/gs, '').replace(/<s>|<\/s>/g, '').trim();

      setLoading(false);

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: cleanContent,
        agent: data.agent || "Fossil Expert Agent",
        model: data.model || selectedModel
      }]);

    } catch (error) {
      console.warn("Could not connect to AI core server. Running local Curator AI fallback logic...", error);

      // HIGH-FIDELITY LOCAL CURATOR RESPONSE FALLBACK
      let fallbackText = "I have queried the offline laboratory telemetry database. Could you clarify your parameters? You can ask about Cambrian Explosion, T-Rex specimens, Morrison formations, or trilobites.";
      let fallbackAgent = "Offline Curator Agent";
      const query = messageContent.toLowerCase();

      if (query.includes("t-rex") || query.includes("tyrannosaur") || query.includes("trex")) {
        fallbackText = "### Specimen Profile: *Tyrannosaurus rex*\n\n- **Geochronology:** Late Cretaceous Epoch // 66.5 Million Years Ago\n- **Stratigraphy:** Hell Creek Formation, MT / WY\n- **Morphology:** Large Theropod Dinosaur with premaxillary slicing teeth capable of crushing skeletal bone.\n\n*Curator Field Log:* Vance recovered five articulating vertebrae in Sector D exhibiting rich dark mineral stains indicating peak preservation within sedimentary sands.";
        fallbackAgent = "Geological Agent";
      } else if (query.includes("cambrian")) {
        fallbackText = "### Geological Profile: The Cambrian Explosion\n\n- **Geochronology:** 541 - 485 Million Years Ago // Paleozoic Era\n- **Ecosystem:** Warm marine transgressions covering Pangea cores.\n- **Significance:** Massive radiation of complex multicellular organisms. First appearance of chitinous exoskeletons and composite eyes.\n\n*Catalog Index Specimen:* Suture trilobites and large marine predators like *Anomalocaris* dominate these beds.";
        fallbackAgent = "Geological Agent";
      } else if (query.includes("morrison") || query.includes("jurassic")) {
        fallbackText = "### Geological Strata: Morrison Formation\n\n- **Geochronology:** Late Jurassic Epoch // 156 - 146 Million Years Ago\n- **Matrix Layers:** Fine claystone, siltstone, and grey sandstone deposits.\n- **Index Discoveries:** Large sauropod skeletons (*Brachiosaurus*, *Apatosaurus*) and armored dinosaurs (*Stegosaurus*).\n\n*Excavation Hotspot:* Located at Digsite-12 (Colorado/Wyoming) with a high probability score of 87%.";
        fallbackAgent = "Excavation Agent";
      } else if (query.includes("trilobite")) {
        fallbackText = "### Specimen Profile: *Trilobita* (Arthropoda)\n\n- **Geochronology:** Paleozoic Era (Cambrian to Permian Period // 521-252 Million Years Ago)\n- **Anatomy:** Highly specialized three-lobed calcified exoskeleton.\n- **Curator Note:** Extremely abundant index fossils used to calibrate stratigraphic rock layer depth meters worldwide.";
        fallbackAgent = "Literature Agent";
      } else if (query.includes("raptor") || query.includes("velociraptor")) {
        fallbackText = "### Specimen Profile: *Velociraptor mongoliensis*\n\n- **Geochronology:** Late Cretaceous Epoch // 75 - 71 Million Years Ago\n- **Excavation site:** Flaming Cliffs, Gobi Desert\n- **Anatomy:** Highly curved second-digit pedal sickle claws designed for grappling prey.\n\n*Lab Status:* Dynamic sandbox matrix cleared successfully in Block-D7. Full articulating skeleton recovered.";
        fallbackAgent = "Excavation Agent";
      } else if (query.includes("hello") || query.includes("hi ") || query.includes("greetings")) {
        fallbackText = "Greetings, researcher. I am calibrated and active. How may I assist your paleontological inquiry today?";
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackText,
        agent: fallbackAgent,
        model: selectedModel + " (Offline)"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    if (loading || isTyping) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if (audioBlob.size < 1000) return;
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice.webm');

        setLoading(true);
        try {
          const response = await axios.post(`${API_BASE}/api/transcribe/`, formData);
          if (response.data.error) {
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: `Transcription error: ${response.data.error}`,
              agent: "System Lobe",
              model: "STT Pipeline"
            }]);
          } else if (response.data.text) {
            handleSend(response.data.text);
          }
        } catch (err) {
          console.warn("Speech transcription offline. Recording cleared.", err);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: "Transcription failed: Unable to connect to the STT backend.",
            agent: "System Lobe",
            model: "STT Offline"
          }]);
        } finally {
          setLoading(false);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const speakMessage = async (text) => {
    try {
      const response = await axios.post(`${API_BASE}/api/synthesize/`, { text });
      if (response.data.audio_url) {
        const audioUrl = response.data.audio_url.startsWith('http')
          ? response.data.audio_url
          : `${API_BASE}${response.data.audio_url}`;
        const audio = new Audio(audioUrl);
        audio.play();
      }
    } catch (err) {
      console.warn("Speech synthesis offline.", err);
    }
  };

  const getAgentColor = (agent) => {
    const agentLower = (agent || '').toLowerCase();
    if (agentLower.includes('excavation')) return 'var(--earth-sand)';
    if (agentLower.includes('geological')) return 'var(--earth-copper)';
    if (agentLower.includes('literature') || agentLower.includes('expert')) return 'var(--earth-amber)';
    return 'var(--earth-sand-muted)';
  };

  return (
    <div style={{
      padding: '6px 0',
      height: 'calc(100vh - 110px)',
      display: 'flex',
      flexDirection: 'column',
      width: '95%',
      maxWidth: 'none',
      margin: '0 auto'
    }}>
      <header style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span className="catalog-tag">ASK-AI // LAB ASSISTANT</span>
          <h1 style={{ fontSize: '1.6rem', marginTop: '4px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            Ask AI <span className="gradient-text">Desk Intelligence</span>
          </h1>
        </div>

        {/* Model selector dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(18, 14, 13, 0.6)', padding: '8px 18px', border: '1px solid rgba(212, 163, 115, 0.15)', boxShadow: 'var(--glass-bevel)' }}>
          <Cpu size={12} color="var(--earth-sand)" />
          <span style={{ fontSize: '9px', color: 'var(--earth-sand-muted)', fontWeight: 'bold', fontFamily: 'var(--font-number)', letterSpacing: '0.1em' }}>WEIGHTS:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '9px',
              fontFamily: 'var(--font-number)',
              fontWeight: '600',
              outline: 'none',
              cursor: 'pointer',
              letterSpacing: '0.05em'
            }}
          >
            <option value="qwen2.5:1.5b" style={{ background: '#0a0a0a' }}>QWEN 2.5 (1.5B) - ULTRA LOW</option>
            <option value="qwen2.5:3b" style={{ background: '#0a0a0a' }}>QWEN 2.5 (3B) - LOW</option>
            <option value="qwen2.5:7b" style={{ background: '#0a0a0a' }}>QWEN 2.5 (7B) - BALANCED</option>
            <option value="deepseek-r1:8b" style={{ background: '#0a0a0a' }}>DEEPSEEK R1 (8B) - REASONING</option>
            <option value="mistral:7b" style={{ background: '#0a0a0a' }}>MISTRAL (7B)</option>
          </select>
        </div>
      </header>

      {/* Chat Window Glass Panel */}
      <div className="glass-card" style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '0',
        border: '1px solid rgba(212, 163, 115, 0.12)',
        background: 'rgba(18, 14, 13, 0.3)',
        boxShadow: 'var(--shadow-deep), var(--glass-bevel)'
      }}>

        {/* Scrollable Conversation Matrix */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const bubbleColor = isUser ? 'rgba(167, 107, 67, 0.05)' : 'rgba(212, 163, 115, 0.03)';
            const borderColor = isUser ? 'rgba(167, 107, 67, 0.22)' : 'rgba(212, 163, 115, 0.15)';
            const borderSide = isUser ? '3px solid var(--earth-copper)' : '3px solid var(--earth-sand)';

            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                key={idx}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: isUser ? '70%' : '92%',
                  width: isUser ? 'fit-content' : '92%',
                  flexDirection: isUser ? 'row-reverse' : 'row'
                }}
              >
                {/* Glowing Avatar Sphere */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isUser ? 'var(--earth-copper)' : '#080706',
                    border: `1.5px solid ${isUser ? 'var(--earth-copper)' : 'rgba(212, 163, 115, 0.25)'}`,
                    boxShadow: 'var(--glass-bevel)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: isUser ? '#080706' : 'var(--earth-sand)',
                    cursor: !isUser ? 'pointer' : 'default',
                    transition: 'var(--transition-cubic)'
                  }}
                  onClick={() => !isUser && speakMessage(msg.content)}
                  title={!isUser ? "Speak synthesized log" : ""}
                  className="avatar-sphere"
                >
                  {isUser ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                  {/* Custom Sand-Glass Chat Bubble */}
                  <div
                    style={{
                      background: bubbleColor,
                      border: `1px solid ${borderColor}`,
                      borderLeft: !isUser ? borderSide : `1px solid ${borderColor}`,
                      borderRight: isUser ? borderSide : `1px solid ${borderColor}`,
                      padding: '14px 20px',
                      borderRadius: '2px',
                      boxShadow: 'var(--glass-bevel)',
                      lineHeight: '1.75',
                      fontSize: '1rem',
                      color: '#ffffff',
                      fontFamily: isUser ? 'var(--font-body)' : 'var(--font-editorial)',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                    className="markdown-content"
                  >
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                    {!isUser && (
                      <div style={{ marginTop: '8px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--earth-sand-muted)', display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.55 }}>
                        <Volume2 size={10} /> CLICK AVATAR TO SPEAK
                      </div>
                    )}
                  </div>

                  {/* Multi-Agent Architecture Metadata Badges */}
                  {!isUser && msg.agent && (
                    <div style={{ display: 'flex', gap: '8px', marginLeft: '5px', marginTop: '2px' }}>
                      <span style={{
                        fontSize: '0.65rem',
                        background: 'rgba(255,255,255,0.02)',
                        color: getAgentColor(msg.agent),
                        padding: '2px 8px',
                        borderRadius: '1px',
                        border: '1px solid rgba(212,163,115,0.15)',
                        fontWeight: 'bold',
                        fontFamily: 'var(--font-number)',
                        letterSpacing: '0.05em'
                      }}>
                        {msg.agent.toUpperCase()}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        background: 'rgba(255,255,255,0.02)',
                        color: 'var(--text-dim)',
                        padding: '2px 8px',
                        borderRadius: '1px',
                        border: '1px solid rgba(212,163,115,0.12)',
                        fontFamily: 'var(--font-number)',
                        letterSpacing: '0.05em'
                      }}>
                        NODE: {msg.model.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* AI Loading State */}
          {loading && (
            <div style={{ display: 'flex', gap: '15px', alignSelf: 'flex-start' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#080706',
                border: '1.5px solid rgba(212, 163, 115, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--earth-sand)'
              }}>
                <Sparkles size={16} />
              </div>
              <div style={{
                background: 'rgba(212, 163, 115, 0.02)',
                padding: '20px 24px',
                borderRadius: '2px',
                border: '1px solid rgba(212, 163, 115, 0.1)',
                color: 'var(--earth-sand)',
                fontFamily: 'var(--font-number)',
                fontSize: '9px',
                fontWeight: 700,
                letterSpacing: '0.15em'
              }}>
                GENERATING...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Matrix */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(212, 163, 115, 0.1)', background: 'rgba(8,7,6,0.5)', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>

            {/* Microphone transcription button */}
            <button
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              disabled={loading || isTyping}
              style={{
                background: isRecording ? 'var(--earth-copper)' : 'rgba(8, 7, 6, 0.7)',
                border: `1px solid ${isRecording ? 'var(--earth-copper)' : 'rgba(212, 163, 115, 0.15)'}`,
                color: isRecording ? '#080706' : 'var(--text-muted)',
                cursor: (loading || isTyping) ? 'not-allowed' : 'pointer',
                opacity: (loading || isTyping) ? 0.3 : 1,
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-cubic)',
                boxShadow: 'var(--glass-bevel)'
              }}
              title="Hold to record audio query"
              className="mic-action-btn"
            >
              <Mic size={20} className={isRecording ? "animate-pulse" : ""} />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={loading || isTyping || isRecording}
              placeholder={isRecording ? "TRANSCRIBING VOCAL MATRIX..." : "ASK REGARDING TAXONOMY OR STRATA SPECIMENS (e.g. 'Cambrian Explosion' or 'T-Rex')..."}
              style={{
                flex: 1,
                padding: '18px 24px',
                borderRadius: '2px', // Sharp lab layout
                background: 'rgba(8, 7, 6, 0.7)',
                border: '1px solid rgba(212, 163, 115, 0.15)',
                color: '#ffffff',
                outline: 'none',
                resize: 'none',
                minHeight: '56px',
                maxHeight: '150px',
                fontFamily: 'var(--font-body)',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                fontWeight: 400,
                boxShadow: 'inset 0 3px 8px rgba(0, 0, 0, 0.9)',
                opacity: (loading || isTyping) ? 0.6 : 1
              }}
            />

            {/* Circular Send Button */}
            <button
              onClick={() => handleSend()}
              disabled={loading || isTyping || !input.trim()}
              style={{
                background: 'linear-gradient(135deg, var(--earth-copper), var(--earth-sand))',
                color: '#080706',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                cursor: (loading || isTyping || !input.trim()) ? 'not-allowed' : 'pointer',
                transition: 'var(--transition-cubic)',
                opacity: (loading || isTyping || !input.trim()) ? 0.4 : 1,
                boxShadow: 'var(--glass-bevel)'
              }}
              className="assistant-send-btn"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .avatar-sphere:hover {
          transform: scale(1.06);
          border-color: #ffffff !important;
        }
        .mic-action-btn:hover:not(:disabled) {
          background: rgba(212, 163, 115, 0.05) !important;
          border-color: var(--earth-sand) !important;
          color: #ffffff !important;
        }
        .assistant-send-btn:hover:not(:disabled) {
          transform: scale(1.06);
        }
        .dot-pulse {
          animation: radar-pulse 2.2s infinite ease-in-out;
        }
        .markdown-content p {
          margin-bottom: 1rem;
        }
        .markdown-content p:last-child {
          margin-bottom: 0;
        }
        .markdown-content ul, .markdown-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .markdown-content li {
          margin-bottom: 0.4rem;
        }
        .markdown-content h3 {
          margin: 1rem 0 0.5rem 0;
          font-family: var(--font-display);
          color: var(--earth-sand);
          font-size: 1.1rem;
        }
        .markdown-content h2 {
          margin: 1rem 0 0.5rem 0;
          font-family: var(--font-display);
          color: var(--earth-sand);
          font-size: 1.2rem;
        }
        .markdown-content h1 {
          font-family: var(--font-display);
          color: var(--earth-sand);
          font-size: 1.3rem;
        }
        .markdown-content code {
          background: rgba(212,163,115,0.08);
          padding: 2px 6px;
          font-size: 0.88rem;
          border-radius: 2px;
        }
        .markdown-content pre {
          background: rgba(8,7,6,0.8);
          padding: 12px 16px;
          overflow-x: auto;
          border: 1px solid rgba(212,163,115,0.1);
          border-radius: 2px;
          margin-bottom: 1rem;
        }
        @media (max-width: 768px) {
          .assistant-outer { width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default Assistant;
