import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiSend, FiMoreVertical, FiPhone, FiVideo, FiSmile, FiPaperclip } from 'react-icons/fi'
import { IoChatbubblesSharp } from 'react-icons/io5'
import { FaFire } from 'react-icons/fa'
import { io } from 'socket.io-client'
import axios from 'axios'
import BASE_URL from '../../global_url.js'

/* ─── streak helpers ─── */
const STREAK_KEY = "loopix_streaks";
function _today() { return new Date().toISOString().slice(0, 10); }
function _dayDiff(d) { return Math.round((new Date(_today()) - new Date(d)) / 86400000); }
function _loadStreaks() { try { return JSON.parse(localStorage.getItem(STREAK_KEY)) || {}; } catch { return {}; } }
function getStreak(fId) {
  const e = _loadStreaks()[fId];
  if (!e) return 0;
  return _dayDiff(e.lastDate) <= 1 ? (e.count || 0) : 0;
}
function updateStreak(fId) {
  const all = _loadStreaks(), today = _today(), e = all[fId];
  if (!e) all[fId] = { count: 1, lastDate: today };
  else {
    const d = _dayDiff(e.lastDate);
    if (d === 0) { /* already counted */ }
    else if (d === 1) all[fId] = { count: (e.count || 1) + 1, lastDate: today };
    else all[fId] = { count: 1, lastDate: today };
  }
  localStorage.setItem(STREAK_KEY, JSON.stringify(all));
}


const avatarColors = ["#dc2626", "#7c3aed", "#0891b2", "#059669", "#d97706", "#db2777"]

export default function Chats() {
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [chatList, setChatList] = useState([])
  const [messages, setMessages] = useState([])
  const [user] = useState(() => JSON.parse(localStorage.getItem('loopix_user')) || null)
  // Snap viewer overlay: { src, senderName }
  const [snapViewer, setSnapViewer] = useState(null)

  // Track opened snaps in localStorage
  const [openedSnaps, setOpenedSnaps] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('loopix_opened_snaps')) || [];
    } catch {
      return [];
    }
  });

  const markSnapAsOpened = (msgId) => {
    if (!msgId) return;
    setOpenedSnaps(prev => {
      if (prev.includes(msgId)) return prev;
      const updated = [...prev, msgId];
      localStorage.setItem('loopix_opened_snaps', JSON.stringify(updated));
      return updated;
    });
  };

  const socketRef = useRef(null)
  const selectedChatRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Keep ref up to date to prevent closure stale states in socket listeners
  useEffect(() => {
    selectedChatRef.current = selected
    if (selected) {
      fetchHistory(selected)
    }
  }, [selected])

  const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return { headers: { 'x-api-key': token } };
  };

  // Connect socket and fetch chat list on mount
  useEffect(() => {
    fetchChatList();

    socketRef.current = io(BASE_URL);

    if (user && user.id) {
      socketRef.current.emit('join_room', user.id);
    }

    socketRef.current.on('receive_message', (msg) => {
      // If msg belongs to currently active conversation
      const currentActive = selectedChatRef.current;
      if (currentActive && (msg.sender === currentActive || msg.receiver === currentActive)) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Call read endpoint to mark as read
        axios.get(`${BASE_URL}/messages/${currentActive}`, getHeaders()).catch(err => console.error(err));
      }
      // Refresh list to update previews
      fetchChatList();
    });

    socketRef.current.on('user_status', (data) => {
      setChatList(prev => prev.map(chat => {
        if (chat.id === data.userId) {
          return { ...chat, online: data.online };
        }
        return chat;
      }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    }
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchChatList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/chat-list`, getHeaders());
      if (res.data.status) {
        setChatList(res.data.chatList);
      }
    } catch (err) {
      console.error("Error fetching chat list:", err);
    }
  };

  const fetchHistory = async (friendId) => {
    try {
      const res = await axios.get(`${BASE_URL}/messages/${friendId}`, getHeaders());
      if (res.data.status) {
        setMessages(res.data.messages);
        setChatList(prev => prev.map(c => c.id === friendId ? { ...c, unread: 0 } : c));
      }
    } catch (err) {
      console.error("Error fetching message history:", err);
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !selected || !user) return;

    const payload = {
      senderId: user.id,
      receiverId: selected,
      text: message
    };

    socketRef.current.emit('send_message', payload);
    setMessage('');
  };

  const filtered = chatList.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const selectedChat = chatList.find(c => c.id === selected)

  // Format date helper
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      height: "calc(100vh - 60px)",
      display: "flex",
      background: "#f9fafb",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      {/* Sidebar */}
      <div style={{
        width: "360px",
        maxWidth: "360px",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }} className={`chats-sidebar${selected ? " hidden" : ""}`}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1rem 0.75rem", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ color: "#111827", fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.875rem", letterSpacing: "0.5px" }}>
            Messages
          </h2>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.875rem" }} />
            <input
              type="text" placeholder="Search chats..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "0.6rem 0.75rem 0.6rem 2.25rem",
                background: "#f3f4f6", border: "1px solid #e5e7eb",
                borderRadius: "10px", color: "#111827", fontSize: "0.825rem",
                boxSizing: "border-box", outline: "none",
              }}
            />
          </div>
        </div>

        {/* Chat List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
              <IoChatbubblesSharp style={{ fontSize: "2.5rem", marginBottom: "0.5rem", color: "rgba(220,38,38,0.1)" }} />
              <p style={{ fontSize: "0.85rem", fontWeight: "600" }}>No conversations found</p>
              <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>Add friends to start chatting!</p>
            </div>
          ) : filtered.map((chat, i) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(chat.id)}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem 0.75rem",
                borderRadius: "12px",
                background: selected === chat.id ? "rgba(220,38,38,0.05)" : "transparent",
                border: selected === chat.id ? "1px solid rgba(220,38,38,0.15)" : "1px solid transparent",
                cursor: "pointer", transition: "all 0.15s ease", marginBottom: "2px",
              }}
              whileHover={{ background: "rgba(0,0,0,0.025)" }}
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: "46px", height: "46px", borderRadius: "50%",
                  background: `linear-gradient(135deg, ${avatarColors[i % avatarColors.length]}, ${avatarColors[i % avatarColors.length]}88)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: "800", fontSize: "1rem",
                }}>{chat.avatar}</div>
                {chat.online && (
                  <div style={{
                    position: "absolute", bottom: "1px", right: "1px",
                    width: "11px", height: "11px", background: "#22c55e",
                    border: "2px solid #ffffff", borderRadius: "50%",
                  }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: 0 }}>
                    <span style={{ color: "#111827", fontWeight: "700", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.name}</span>
                    {getStreak(chat.id) > 0 && (
                      <span style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "0.68rem", fontWeight: "800", color: "#f97316", flexShrink: 0 }}>
                        <FaFire style={{ fontSize: "0.6rem" }} />{getStreak(chat.id)}
                      </span>
                    )}
                  </div>
                  <span style={{ color: "#9ca3af", fontSize: "0.7rem", flexShrink: 0, marginLeft: "0.5rem" }}>{chat.time}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#6b7280", fontSize: "0.775rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: chat.unread > 0 ? "700" : "400" }}>
                    {chat.lastMsg?.startsWith('data:image/') ? "📷 Snap" : chat.lastMsg}
                  </span>
                  {chat.unread > 0 && (
                    <div style={{
                      width: "18px", height: "18px", background: "#dc2626",
                      borderRadius: "50%", color: "#fff", fontSize: "0.6rem",
                      fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "0.5rem",
                    }}>{chat.unread}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selected ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#f3f4f6" }}>
          {/* Chat Header */}
          <div style={{
            padding: "0.875rem 1.25rem", borderBottom: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", gap: "0.75rem",
            background: "#ffffff",
          }}>
            <button onClick={() => setSelected(null)} className="back-btn-chat" style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: "1.1rem", display: "none", marginRight: "0.25rem" }}>←</button>
            <div style={{ position: "relative" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(135deg, ${avatarColors[chatList.findIndex(c=>c.id===selected) % avatarColors.length || 0]}, ${avatarColors[chatList.findIndex(c=>c.id===selected) % avatarColors.length || 0]}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.9rem" }}>
                {selectedChat?.avatar}
              </div>
              {selectedChat?.online && <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", background: "#22c55e", border: "2px solid #ffffff", borderRadius: "50%" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#111827", fontWeight: "700", fontSize: "0.9rem", margin: 0 }}>{selectedChat?.name}</p>
              <p style={{ color: selectedChat?.online ? "#16a34a" : "#9ca3af", fontSize: "0.7rem", margin: 0, fontWeight: "600" }}>
                {selectedChat?.online ? "● Online" : "● Offline"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[FiPhone, FiVideo, FiMoreVertical].map((Icon, i) => (
                <button key={i} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.45rem", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <Icon style={{ fontSize: "0.9rem" }} />
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {messages.map((msg, i) => {
              const myId = user?.id || user?._id;
              const senderId = typeof msg.sender === 'object' ? (msg.sender?._id || msg.sender?.id) : msg.sender;
              const isSentByMe = String(senderId) === String(myId);
              const isSnap = msg.text?.startsWith('data:image/') || msg.text?.startsWith('http://') || msg.text?.startsWith('https://');
              const isOpened = isSnap && openedSnaps.includes(msg._id);

              return (
                <motion.div key={msg._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  style={{ display: "flex", justifyContent: isSentByMe ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "72%", padding: "0.6rem 0.875rem",
                    background: isSentByMe ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "#ffffff",
                    borderRadius: isSentByMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    color: isSentByMe ? "#ffffff" : "#111827", fontSize: "0.875rem", lineHeight: "1.5",
                    border: isSentByMe ? "none" : "1px solid #e5e7eb",
                    boxShadow: isSentByMe ? "0 4px 12px rgba(220,38,38,0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                  }}>
                    {isSnap ? (
                      <div
                        onClick={() => {
                          if (!isSentByMe) {
                            if (!isOpened) {
                              markSnapAsOpened(msg._id);
                              updateStreak(selected);
                              setSnapViewer({ src: msg.text, senderName: selectedChat?.name || "Friend" });
                            }
                          } else {
                            // Sender preview
                            setSnapViewer({ src: msg.text, senderName: "You" });
                          }
                        }}
                        style={{
                          position: "relative",
                          cursor: (isSentByMe || !isOpened) ? "pointer" : "default",
                          maxWidth: "200px",
                        }}
                      >
                        {isSentByMe ? (
                          /* Sent snap card */
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "0.5rem 0.75rem",
                            borderRadius: "12px",
                            background: "rgba(255,255,255,0.15)",
                            color: "#ffffff"
                          }}>
                            <span style={{ fontSize: "1.2rem" }}>📷</span>
                            <div>
                              <p style={{ fontSize: "0.78rem", fontWeight: 700, margin: 0 }}>Snap Sent</p>
                              <p style={{ fontSize: "0.62rem", opacity: 0.8, margin: 0 }}>Tap to preview</p>
                            </div>
                          </div>
                        ) : isOpened ? (
                          /* Received snap — Already Opened */
                          <div style={{
                            width: "180px",
                            height: "65px",
                            borderRadius: "12px",
                            background: "#f3f4f6",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "0 0.875rem",
                            border: "1px solid #e5e7eb",
                          }}>
                            <span style={{ fontSize: "1.2rem", color: "#9ca3af" }}>📷</span>
                            <div>
                              <p style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 700, margin: 0 }}>Snap Opened</p>
                              <p style={{ fontSize: "0.62rem", color: "#9ca3af", margin: 0 }}>Expired</p>
                            </div>
                          </div>
                        ) : (
                          /* Received snap — New / Unopened */
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              width: "180px",
                              height: "90px",
                              borderRadius: "14px",
                              background: "linear-gradient(135deg,#dc2626,#991b1b)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "4px",
                              color: "#fff",
                              boxShadow: "0 6px 20px rgba(220,38,38,0.3)",
                            }}
                          >
                            <span style={{ fontSize: "1.5rem" }}>📷</span>
                            <span style={{ fontSize: "0.8rem", fontWeight: 800 }}>New Snap</span>
                            <span style={{ fontSize: "0.62rem", opacity: 0.9 }}>Tap to open • 3s timer</span>
                          </motion.div>
                        )}
                      </div>
                    ) : (
                      msg.text
                    )}
                    <div style={{ marginTop: "0.2rem", fontSize: "0.6rem", color: isSentByMe ? "rgba(255,255,255,0.6)" : "#9ca3af", textAlign: "right" }}>{formatTime(msg.createdAt)}</div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: "0.875rem 1rem", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "0.625rem", background: "#ffffff" }}>
            <button type="button" style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center" }}><FiPaperclip /></button>
            <button type="button" style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center" }}><FiSmile /></button>
            <input
              type="text" placeholder="Type a message..." value={message}
              onChange={e => setMessage(e.target.value)}
              style={{
                flex: 1, padding: "0.6rem 0.875rem",
                background: "#f3f4f6", border: "1px solid #e5e7eb",
                borderRadius: "24px", color: "#111827", fontSize: "0.875rem", outline: "none",
              }}
            />
            <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{
                padding: "0.6rem", borderRadius: "50%", border: "none",
                background: message.trim() ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "#f3f4f6",
                color: message.trim() ? "#fff" : "#9ca3af", cursor: message.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: message.trim() ? "0 4px 12px rgba(220,38,38,0.2)" : "none", transition: "all 0.2s ease",
              }}>
              <FiSend style={{ fontSize: "1rem" }} />
            </motion.button>
          </form>
        </div>
      ) : (
        // Empty state (desktop)
        <div className="chat-window-empty" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
          <IoChatbubblesSharp style={{ fontSize: "4rem", marginBottom: "1rem", color: "rgba(220,38,38,0.1)" }} />
          <p style={{ fontSize: "1rem", fontWeight: "600", color: "#4b5563" }}>Select a chat to start messaging</p>
          <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Your conversations will appear here</p>
        </div>
      )}

      {/* ── Fullscreen Snap Viewer Overlay ── */}
      <AnimatePresence>
        {snapViewer && (
          <SnapViewerOverlay
            src={snapViewer.src}
            senderName={snapViewer.senderName}
            onClose={() => setSnapViewer(null)}
          />
        )}
      </AnimatePresence>

      <style>{`
        input::placeholder { color: #9ca3af !important; }
        /* Mobile: hide sidebar when a chat is open */
        @media(max-width: 640px) {
          .chats-sidebar {
            position: fixed !important;
            top: 60px; left: 0; right: 0; bottom: 0;
            z-index: 5;
            max-width: 100% !important;
            width: 100% !important;
            display: flex;
          }
          .chats-sidebar.hidden { display: none !important; }
          .back-btn-chat { display: flex !important; }
          .chat-window-empty { display: none !important; }
          .chat-window-mobile { display: flex !important; }
        }
        @media(min-width: 641px) {
          .chats-sidebar { position: static !important; display: flex !important; }
          .chat-window-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

/* ─── Snap Viewer: fullscreen overlay with 3s timer ─── */
function SnapViewerOverlay({ src, senderName, onClose }) {
  const [progress, setProgress] = useState(100);
  const timerRef = useRef(null);
  const DURATION = 3000; // ms

  useEffect(() => {
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current);
        onClose();
      }
    }, 50);
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Progress bar */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "4px",
        background: "rgba(255,255,255,0.15)",
        zIndex: 10,
      }}>
        <motion.div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg,#dc2626,#f97316)",
            transition: "width 0.05s linear",
          }}
        />
      </div>

      {/* Top sender header */}
      <div style={{
        position: "absolute",
        top: "20px", left: "20px",
        display: "flex", alignItems: "center", gap: "10px",
        color: "#ffffff", zIndex: 10,
      }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%",
          background: "linear-gradient(135deg,#dc2626,#991b1b)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: "0.85rem", color: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)"
        }}>
          {(senderName || "S").charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontSize: "0.9rem", fontWeight: 800, margin: 0, color: "#ffffff" }}>{senderName || "Snap"}</p>
          <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>Snapchat Story Mode</p>
        </div>
      </div>

      {/* Close hint */}
      <div style={{
        position: "absolute",
        top: "20px", right: "20px",
        color: "rgba(255,255,255,0.7)",
        fontSize: "0.75rem",
        fontWeight: 600,
        letterSpacing: "0.5px",
        fontFamily: "'Inter',sans-serif",
        zIndex: 10,
        background: "rgba(0,0,0,0.4)",
        padding: "4px 10px",
        borderRadius: "20px"
      }}>
        Tap to close
      </div>

      {/* Snap image */}
      <motion.img
        initial={{ scale: 1.04, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        src={src}
        alt="Snap"
        style={{
          maxWidth: "100%",
          maxHeight: "100vh",
          objectFit: "contain",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />

      {/* Bottom watermark */}
      <div style={{
        position: "absolute",
        bottom: "20px",
        left: 0, right: 0,
        textAlign: "center",
        color: "rgba(255,255,255,0.35)",
        fontSize: "0.65rem",
        fontWeight: 800,
        letterSpacing: "2px",
        fontFamily: "'Inter',sans-serif",
      }}>
        LOOPIX SNAP SYSTEM
      </div>
    </motion.div>
  );
}
