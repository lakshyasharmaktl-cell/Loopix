import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import BASE_URL from "../../global_url.js";
import {
  FaCamera,
  FaSyncAlt,
  FaDownload,
  FaRedo,
  FaTimes,
  FaPaperPlane,
  FaSearch,
} from "react-icons/fa";

/* ─── filter presets (CSS filter strings) ─── */
const FILTERS = [
  { name: "Normal",  css: "none" },
  { name: "B&W",     css: "grayscale(100%)" },
  { name: "Sepia",   css: "sepia(85%) saturate(120%)" },
  { name: "Vivid",   css: "saturate(1.6) contrast(1.1) brightness(1.05)" },
  { name: "Cool",    css: "saturate(0.9) hue-rotate(15deg) brightness(1.05)" },
];

/* ─── tiny colour chips shown in the filter bar ─── */
const FILTER_CHIPS = {
  Normal:  "linear-gradient(135deg,#f9fafb,#e5e7eb)",
  "B&W":   "linear-gradient(135deg,#374151,#9ca3af)",
  Sepia:   "linear-gradient(135deg,#92400e,#d97706)",
  Vivid:   "linear-gradient(135deg,#dc2626,#f59e0b)",
  Cool:    "linear-gradient(135deg,#2563eb,#06b6d4)",
};

const avatarColors = ["#dc2626", "#7c3aed", "#0891b2", "#059669", "#d97706", "#db2777"];

export default function Snap() {
  const navigate = useNavigate();

  /* ── state ── */
  const [stream, setStream]             = useState(null);
  const [facingMode, setFacingMode]     = useState("user");       // "user" | "environment"
  const [capturedImage, setCapturedImage] = useState(null);        // data-URL
  const [activeFilter, setActiveFilter] = useState("Normal");
  const [error, setError]               = useState(null);          // string | null
  const [flashAnim, setFlashAnim]       = useState(false);
  const [countdown, setCountdown]       = useState(null);          // null | 3 | 2 | 1

  // Send Modal States
  const [showSendModal, setShowSendModal] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingSnap, setSendingSnap] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const [user] = useState(() => JSON.parse(localStorage.getItem("loopix_user")) || null);

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  /* ─────────────────────── camera helpers ─────────────────────── */
  const stopStream = useCallback(() => {
    if (stream) stream.getTracks().forEach((t) => t.stop());
  }, [stream]);

  const startCamera = useCallback(
    async (facing) => {
      try {
        stopStream();
        const constraints = {
          video: {
            facingMode: facing,
            width:  { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };
        const s = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(s);
        setError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          setError("permission");
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          setError("notfound");
        } else {
          setError("generic");
        }
      }
    },
    [stopStream],
  );

  /* initialise camera on mount */
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("unsupported");
      return;
    }
    startCamera(facingMode);
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* toggle front ↔ back */
  const toggleCamera = () => {
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);
    startCamera(next);
  };

  /* ─────────────────────── capture ─────────────────────── */
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    /* mirror if front camera */
    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    /* apply chosen CSS filter to canvas */
    const filterObj = FILTERS.find((f) => f.name === activeFilter);
    ctx.filter = filterObj ? filterObj.css : "none";

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    setCapturedImage(dataUrl);

    /* flash */
    setFlashAnim(true);
    setTimeout(() => setFlashAnim(false), 350);

    stopStream();
  };

  /* retake */
  const retake = () => {
    setCapturedImage(null);
    setActiveFilter("Normal");
    startCamera(facingMode);
  };

  /* download */
  const downloadPhoto = () => {
    if (!capturedImage) return;

    /* re-render to a fresh canvas with the current filter */
    const img = new Image();
    img.onload = () => {
      const c   = document.createElement("canvas");
      c.width   = img.width;
      c.height  = img.height;
      const ctx = c.getContext("2d");
      const filterObj = FILTERS.find((f) => f.name === activeFilter);
      ctx.filter = filterObj ? filterObj.css : "none";
      ctx.drawImage(img, 0, 0);

      const a    = document.createElement("a");
      a.href     = c.toDataURL("image/png");
      a.download = `loopix-snap-${Date.now()}.png`;
      a.click();
    };
    img.src = capturedImage;
  };

  const getHeaders = () => {
    const token = localStorage.getItem("auth_token");
    return { headers: { "x-api-key": token } };
  };

  const openSendModal = async () => {
    setShowSendModal(true);
    setFriendsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/friends`, getHeaders());
      if (res.data.status) {
        setFriends(res.data.friends.map(f => ({
          id: f._id,
          name: f.name,
          email: f.email,
          profileImg: f.profileImg,
          avatar: f.name ? f.name.charAt(0).toUpperCase() : 'U'
        })));
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to load friends list");
    } finally {
      setFriendsLoading(false);
    }
  };

  const sendSnap = async () => {
    if (!selectedFriend || !capturedImage || !user) return;
    setSendingSnap(true);

    try {
      /* Re-render the image with the current filter applied before sending */
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d");
        const filterObj = FILTERS.find((f) => f.name === activeFilter);
        ctx.filter = filterObj ? filterObj.css : "none";
        ctx.drawImage(img, 0, 0);

        const filteredBase64 = c.toDataURL("image/png");

        // Send via socket.io
        const socket = io(BASE_URL);
        socket.emit("join_room", user.id);
        socket.emit("send_message", {
          senderId: user.id,
          receiverId: selectedFriend,
          text: filteredBase64
        });

        // Small delay to let socket deliver and disconnect
        setTimeout(() => {
          socket.disconnect();
          toast.success("Snap sent successfully! ✉️");
          setSendingSnap(false);
          setShowSendModal(false);
          navigate("/chats");
        }, 1000);
      };
      img.src = capturedImage;

    } catch (err) {
      console.error(err);
      toast.error("Error sending snap");
      setSendingSnap(false);
    }
  };

  /* ─────────────────────── styles ─────────────────────── */
  const font = "'Inter','Segoe UI',sans-serif";

  const wrapperStyle = {
    position: "relative",
    width: "100%",
    height: "calc(100vh - 60px)",
    background: "#000",
    overflow: "hidden",
    fontFamily: font,
    display: "flex",
    flexDirection: "column",
  };

  const videoStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transform: facingMode === "user" ? "scaleX(-1)" : "none",
    filter: FILTERS.find((f) => f.name === activeFilter)?.css || "none",
    display: capturedImage ? "none" : "block",
  };

  const capturedStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    filter: FILTERS.find((f) => f.name === activeFilter)?.css || "none",
  };

  /* ─────────────────────── error screen ─────────────────────── */
  if (error) {
    const messages = {
      unsupported:
        "Your browser doesn't support camera access. Please try a modern browser like Chrome or Firefox.",
      permission:
        "Camera permission was denied. Please allow camera access in your browser settings and reload.",
      notfound:
        "No camera device was found on this device. Please connect a camera and try again.",
      generic:
        "Something went wrong while accessing the camera. Please reload and try again.",
    };

    const titles = {
      unsupported: "Camera Not Supported",
      permission: "Permission Denied",
      notfound: "No Camera Found",
      generic: "Camera Error",
    };

    return (
      <div
        style={{
          ...wrapperStyle,
          background: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            padding: "2.5rem 2rem",
            maxWidth: "380px",
            width: "90%",
            textAlign: "center",
            boxShadow: "0 12px 40px rgba(0,0,0,0.06)",
          }}
        >
          {/* icon */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "rgba(220,38,38,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
            }}
          >
            <FaCamera style={{ fontSize: "1.6rem", color: "#dc2626" }} />
          </div>

          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              color: "#111827",
              margin: "0 0 0.5rem",
            }}
          >
            {titles[error]}
          </h2>

          <p
            style={{
              fontSize: "0.85rem",
              color: "#6b7280",
              lineHeight: 1.6,
              margin: "0 0 1.5rem",
            }}
          >
            {messages[error]}
          </p>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => window.location.reload()}
            style={{
              padding: "0.7rem 2rem",
              borderRadius: "12px",
              border: "none",
              background: "linear-gradient(135deg,#dc2626,#b91c1c)",
              color: "#fff",
              fontSize: "0.85rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(220,38,38,0.25)",
              fontFamily: font,
            }}
          >
            Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  /* ─────────────────────── main render ─────────────────────── */
  return (
    <div style={wrapperStyle}>
      {/* ── hidden canvas for capture ── */}
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {/* ── camera flash ── */}
      <AnimatePresence>
        {flashAnim && (
          <motion.div
            key="flash"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              position: "absolute",
              inset: 0,
              background: "#fff",
              zIndex: 30,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── live video ── */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={videoStyle}
      />

      {/* ── captured image ── */}
      {capturedImage && (
        <motion.img
          key="preview"
          src={capturedImage}
          alt="Captured"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={capturedStyle}
        />
      )}

      {/* ── top gradient overlay ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "120px",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* ── header text ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          position: "absolute",
          top: "16px",
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <FaCamera style={{ fontSize: "0.85rem", color: "#fff" }} />
        <span
          style={{
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "2.5px",
            color: "#fff",
            textTransform: "uppercase",
            fontFamily: font,
          }}
        >
          Loopix Snap
        </span>
      </motion.div>

      {/* ── bottom gradient overlay ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: capturedImage ? "220px" : "180px",
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, transparent 100%)",
          pointerEvents: "none",
          zIndex: 5,
        }}
      />

      {/* ─────── controls layer ─────── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          paddingBottom: "28px",
        }}
      >
        <AnimatePresence mode="wait">
          {!capturedImage ? (
            /* ═══ CAPTURE MODE ═══ */
            <motion.div
              key="capture-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.25 }}
            >
              {/* filter chips – shown before capture too for live preview */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "22px",
                  flexWrap: "wrap",
                  padding: "0 1rem",
                }}
              >
                {FILTERS.map((f) => {
                  const active = activeFilter === f.name;
                  return (
                    <motion.button
                      key={f.name}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveFilter(f.name)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "50px",
                        border: active
                           ? "2px solid #fff"
                           : "1px solid rgba(255,255,255,0.25)",
                        background: active
                           ? "rgba(255,255,255,0.2)"
                           : "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(6px)",
                        cursor: "pointer",
                        fontFamily: font,
                        transition: "all 0.2s",
                      }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: FILTER_CHIPS[f.name],
                          border: "1px solid rgba(255,255,255,0.3)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: active ? 700 : 500,
                          color: "#fff",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {f.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* capture + flip row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "36px",
                }}
              >
                {/* spacer for symmetry */}
                <div style={{ width: 48 }} />

                {/* big capture button */}
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={capturePhoto}
                  style={{
                    width: 76,
                    height: 76,
                    borderRadius: "50%",
                    border: "4px solid rgba(255,255,255,0.85)",
                    background: "linear-gradient(135deg,#dc2626,#b91c1c)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow:
                      "0 0 0 4px rgba(220,38,38,0.25), 0 8px 30px rgba(0,0,0,0.35)",
                    position: "relative",
                  }}
                >
                  {/* inner white ring */}
                  <span
                    style={{
                      width: 58,
                      height: 58,
                      borderRadius: "50%",
                      border: "3px solid rgba(255,255,255,0.35)",
                      position: "absolute",
                    }}
                  />
                  <FaCamera style={{ fontSize: "1.25rem", color: "#fff" }} />
                </motion.button>

                {/* flip button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 180 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleCamera}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "1.1rem",
                  }}
                >
                  <FaSyncAlt />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* ═══ REVIEW MODE ═══ */
            <motion.div
              key="review-controls"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
            >
              {/* filter bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  marginBottom: "20px",
                  flexWrap: "wrap",
                  padding: "0 1rem",
                }}
              >
                {FILTERS.map((f) => {
                  const active = activeFilter === f.name;
                  return (
                    <motion.button
                      key={f.name}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setActiveFilter(f.name)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 14px",
                        borderRadius: "50px",
                        border: active
                           ? "2px solid #fff"
                           : "1px solid rgba(255,255,255,0.25)",
                        background: active
                           ? "rgba(255,255,255,0.22)"
                           : "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(6px)",
                        cursor: "pointer",
                        fontFamily: font,
                        transition: "all 0.2s",
                      }}
                    >
                      <span
                        style={{
                          width: 14,
                          height: 14,
                          borderRadius: "50%",
                          background: FILTER_CHIPS[f.name],
                          border: "1px solid rgba(255,255,255,0.3)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: active ? 700 : 500,
                          color: "#fff",
                          letterSpacing: "0.3px",
                        }}
                      >
                        {f.name}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* action buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "14px",
                }}
              >
                {/* Retake */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={retake}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 22px",
                    borderRadius: "50px",
                    border: "1px solid rgba(255,255,255,0.3)",
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    color: "#fff",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: font,
                    letterSpacing: "0.3px",
                  }}
                >
                  <FaRedo style={{ fontSize: "0.75rem" }} />
                  Retake
                </motion.button>

                {/* Save / Download */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={downloadPhoto}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 22px",
                    borderRadius: "50px",
                    background: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: font,
                    letterSpacing: "0.3px",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <FaDownload style={{ fontSize: "0.78rem" }} />
                  Save
                </motion.button>

                {/* Send Snap Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={openSendModal}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    borderRadius: "50px",
                    border: "none",
                    background: "linear-gradient(135deg,#dc2626,#b91c1c)",
                    color: "#fff",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: font,
                    letterSpacing: "0.3px",
                    boxShadow: "0 6px 24px rgba(220,38,38,0.35)",
                  }}
                >
                  <FaPaperPlane style={{ fontSize: "0.75rem" }} />
                  Send to Friend
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── send to friend modal ── */}
      <AnimatePresence>
        {showSendModal && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                background: "#ffffff",
                borderRadius: "20px",
                width: "100%",
                maxWidth: "380px",
                maxHeight: "80vh",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              }}
            >
              {/* Header */}
              <div style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid #f3f4f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827", margin: 0 }}>Send Snap</h3>
                <button
                  onClick={() => setShowSendModal(false)}
                  style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1rem" }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Search Friends */}
              <div style={{ padding: "0.875rem 1rem", borderBottom: "1px solid #f3f4f6", position: "relative" }}>
                <FaSearch style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.8rem" }} />
                <input
                  type="text"
                  placeholder="Search friends..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem 1rem 0.5rem 2.2rem",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    fontSize: "0.8rem",
                    outline: "none",
                    fontFamily: font,
                  }}
                />
              </div>

              {/* Friends list */}
              <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
                {friendsLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "2.5rem" }}>
                    <div style={{ display: "inline-block", width: "24px", height: "24px", border: "2px solid #dc2626", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  </div>
                ) : friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#9ca3af", fontSize: "0.8rem" }}>
                    No friends found
                  </div>
                ) : (
                  friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map((f, i) => {
                    const isSelected = selectedFriend === f.id;
                    return (
                      <div
                        key={f.id}
                        onClick={() => setSelectedFriend(isSelected ? null : f.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "0.6rem 0.8rem",
                          borderRadius: "12px",
                          background: isSelected ? "rgba(220, 38, 38, 0.05)" : "transparent",
                          cursor: "pointer",
                          marginBottom: "2px",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${avatarColors[i % avatarColors.length]}, ${avatarColors[i % avatarColors.length]}88)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: "800",
                          fontSize: "0.85rem",
                        }}>
                          {f.avatar}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.8rem", fontWeight: "700", color: "#111827", margin: 0 }}>{f.name}</p>
                          <p style={{ fontSize: "0.7rem", color: "#6b7280", margin: 0 }}>{f.email}</p>
                        </div>
                        <div style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "50%",
                          border: isSelected ? "5px solid #dc2626" : "2px solid #d1d5db",
                          background: "#fff",
                          transition: "all 0.1s ease",
                        }} />
                      </div>
                    );
                  })
                )}
              </div>

              {/* Send action footer */}
              <div style={{ padding: "1rem", borderTop: "1px solid #f3f4f6" }}>
                <motion.button
                  whileHover={{ scale: selectedFriend ? 1.02 : 1 }}
                  whileTap={{ scale: selectedFriend ? 0.98 : 1 }}
                  onClick={sendSnap}
                  disabled={!selectedFriend || sendingSnap}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "12px",
                    border: "none",
                    background: selectedFriend ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "#f3f4f6",
                    color: selectedFriend ? "#fff" : "#9ca3af",
                    fontSize: "0.85rem",
                    fontWeight: "700",
                    cursor: selectedFriend ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    boxShadow: selectedFriend ? "0 4px 12px rgba(220,38,38,0.2)" : "none",
                  }}
                >
                  {sendingSnap ? (
                    <div style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                  ) : (
                    <FaPaperPlane style={{ fontSize: "0.8rem" }} />
                  )}
                  Send Snap
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── close / back button (top-right) ── */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.history.back()}
        style={{
          position: "absolute",
          top: 14,
          right: 16,
          zIndex: 10,
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(0,0,0,0.25)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "#fff",
          fontSize: "0.85rem",
        }}
      >
        <FaTimes />
      </motion.button>

      {/* ── subtle corner watermark ── */}
      <span
        style={{
          position: "absolute",
          top: 18,
          left: 18,
          zIndex: 10,
          fontSize: "0.6rem",
          fontWeight: 800,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: "2px",
          fontFamily: font,
          pointerEvents: "none",
        }}
      >
        LOOPIX
      </span>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
