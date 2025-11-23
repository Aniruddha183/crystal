"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { CameraPosition, CameraShape } from "../types";

export const useRecorder = () => {
  // Streams
  const [streamConfig, setStreamConfig] = useState<{
    hasCamera: boolean;
    hasScreen: boolean;
    hasMic: boolean;
  }>({ hasCamera: false, hasScreen: false, hasMic: false });

  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // HTML Elements for source processing (hidden from UI)
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);

  // Compositing
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  // Using number instead of NodeJS.Timeout for browser compatibility
  const timerIntervalRef = useRef<number | null>(null);

  // Configuration
  const [cameraPos, setCameraPos] = useState<CameraPosition>(
    CameraPosition.BOTTOM_LEFT
  );
  const [cameraShape, setCameraShape] = useState<CameraShape>(
    CameraShape.CIRCLE
  );
  const [cameraSize, setCameraSize] = useState<number>(1.0); // Multiplier: 0.5 to 2.0

  // Load preferences from localStorage
  useEffect(() => {
    const savedPos = localStorage.getItem("cameraPos");
    const savedShape = localStorage.getItem("cameraShape");
    const savedSize = localStorage.getItem("cameraSize");

    if (savedPos) setCameraPos(savedPos as CameraPosition);
    if (savedShape) setCameraShape(savedShape as CameraShape);
    if (savedSize) setCameraSize(parseFloat(savedSize));
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem("cameraPos", cameraPos);
    localStorage.setItem("cameraShape", cameraShape);
    localStorage.setItem("cameraSize", cameraSize.toString());
  }, [cameraPos, cameraShape, cameraSize]);

  // Prevent accidental reload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isRecording || recordingBlob) {
        e.preventDefault();
        e.returnValue = ""; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isRecording, recordingBlob]);

  // Initialize Source Video Elements
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (!screenVideoRef.current) {
      screenVideoRef.current = document.createElement("video");
    }
    if (!cameraVideoRef.current) {
      cameraVideoRef.current = document.createElement("video");
    }

    if (screenVideoRef.current) {
      screenVideoRef.current.muted = true;
      screenVideoRef.current.autoplay = true;
      screenVideoRef.current.playsInline = true;
    }

    if (cameraVideoRef.current) {
      cameraVideoRef.current.muted = true; // Local preview muted to avoid echo
      cameraVideoRef.current.autoplay = true;
      cameraVideoRef.current.playsInline = true;
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  }, []);

  const stopStreams = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setStreamConfig({ hasCamera: false, hasScreen: false, hasMic: false });
  }, []);

  const startStreams = async () => {
    try {
      // 1. Get User Media (Cam + Mic)
      // Use 'ideal' constraints to prevent OverconstrainedError on devices that don't support 720p strictly
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      cameraStreamRef.current = userStream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = userStream;
        await cameraVideoRef.current.play();
      }

      // 2. Get Display Media (Screen + System Audio)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: 60,
        },
        audio: true,
      });

      screenStreamRef.current = displayStream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = displayStream;
        await screenVideoRef.current.play();
      }

      // Handle user stopping screen share via browser UI
      displayStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      setStreamConfig({ hasCamera: true, hasMic: true, hasScreen: true });
      setIsMicEnabled(true);
      setIsCameraEnabled(true);
      return true;
    } catch (err) {
      console.error("Error starting streams", err);
      // Clean up any partial streams
      stopStreams();
      return false;
    }
  };

  const toggleMic = useCallback(() => {
    if (cameraStreamRef.current) {
      const audioTracks = cameraStreamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !isMicEnabled;
      });
      setIsMicEnabled(!isMicEnabled);
    }
  }, [isMicEnabled]);

  const toggleCamera = useCallback(() => {
    // We toggle the state to stop drawing on canvas.
    // We also optionally toggle the track to turn off the hardware light,
    // but often people prefer the stream to stay ready.
    // Let's toggle the track for privacy.
    if (cameraStreamRef.current) {
      const videoTracks = cameraStreamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !isCameraEnabled;
      });
      setIsCameraEnabled(!isCameraEnabled);
    }
  }, [isCameraEnabled]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !screenStreamRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const screenVid = screenVideoRef.current;
    const camVid = cameraVideoRef.current;

    if (!screenVid || !camVid) return;

    // Match canvas size to screen size
    if (
      canvas.width !== screenVid.videoWidth ||
      canvas.height !== screenVid.videoHeight
    ) {
      canvas.width = screenVid.videoWidth || 1920;
      canvas.height = screenVid.videoHeight || 1080;
    }

    // 1. Draw Screen
    ctx.drawImage(screenVid, 0, 0, canvas.width, canvas.height);

    // 2. Draw Camera Overlay (Only if enabled and exists)
    if (streamConfig.hasCamera && isCameraEnabled && cameraStreamRef.current) {
      const baseSize = Math.min(canvas.width, canvas.height) * 0.2; // 20% of screen size as base
      const scaledWidth = baseSize * cameraSize;

      // Calculate dimensions based on shape
      let drawW = scaledWidth;
      let drawH = scaledWidth;

      // Use actual video aspect ratio for rectangle
      const camRatio = camVid.videoWidth / (camVid.videoHeight || 1);
      if (cameraShape === CameraShape.RECTANGLE) {
        // Maintain aspect ratio, width = scaledWidth
        drawH = scaledWidth / camRatio;
      }

      const padding = 50;
      let x = padding;
      let y = canvas.height - drawH - padding;

      switch (cameraPos) {
        case CameraPosition.BOTTOM_LEFT:
          x = padding;
          y = canvas.height - drawH - padding;
          break;
        case CameraPosition.BOTTOM_RIGHT:
          x = canvas.width - drawW - padding;
          y = canvas.height - drawH - padding;
          break;
        case CameraPosition.TOP_LEFT:
          x = padding;
          y = padding;
          break;
        case CameraPosition.TOP_RIGHT:
          x = canvas.width - drawW - padding;
          y = padding;
          break;
      }

      ctx.save();

      // Shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 25;
      ctx.shadowOffsetY = 10;

      // Create Shape Path
      ctx.beginPath();
      if (cameraShape === CameraShape.CIRCLE) {
        ctx.arc(x + drawW / 2, y + drawH / 2, drawW / 2, 0, Math.PI * 2);
      } else {
        // Rounded Rectangle
        const r = 24; // border radius
        ctx.roundRect(x, y, drawW, drawH, r);
      }
      ctx.closePath();

      // Fill to render shadow
      ctx.fillStyle = "#000";
      ctx.fill();

      // Clip
      ctx.clip();

      // Reset shadow for video drawing
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      // Draw Video
      if (cameraShape === CameraShape.CIRCLE) {
        // Center crop for square/circle
        let sWidth = camVid.videoWidth;
        let sHeight = camVid.videoHeight;
        let sx = 0;
        let sy = 0;

        if (camRatio > 1) {
          // Landscape source
          sWidth = sHeight;
          sx = (camVid.videoWidth - sWidth) / 2;
        } else {
          // Portrait source
          sHeight = sWidth;
          sy = (camVid.videoHeight - sHeight) / 2;
        }

        // Mirror setup
        ctx.save();
        ctx.translate(x + drawW / 2, y + drawH / 2);
        ctx.scale(-1, 1);
        ctx.translate(-(x + drawW / 2), -(y + drawH / 2));

        ctx.drawImage(camVid, sx, sy, sWidth, sHeight, x, y, drawW, drawH);
        ctx.restore();
      } else {
        // Full frame for rectangle
        ctx.save();
        // Mirroring logic for rectangle center
        ctx.translate(x + drawW / 2, y + drawH / 2);
        ctx.scale(-1, 1);
        ctx.translate(-(x + drawW / 2), -(y + drawH / 2));

        ctx.drawImage(
          camVid,
          0,
          0,
          camVid.videoWidth,
          camVid.videoHeight,
          x,
          y,
          drawW,
          drawH
        );
        ctx.restore();
      }

      ctx.restore(); // Restore clip (to draw border on top)

      // Border Ring
      ctx.beginPath();
      if (cameraShape === CameraShape.CIRCLE) {
        ctx.arc(x + drawW / 2, y + drawH / 2, drawW / 2, 0, Math.PI * 2);
      } else {
        const r = 24;
        ctx.roundRect(x, y, drawW, drawH, r);
      }
      ctx.lineWidth = 6;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)"; // Glassy white
      ctx.stroke();

      // Inner thin ring
      ctx.beginPath();
      if (cameraShape === CameraShape.CIRCLE) {
        ctx.arc(x + drawW / 2, y + drawH / 2, drawW / 2 - 3, 0, Math.PI * 2);
      } else {
        const r = 24;
        ctx.roundRect(x + 3, y + 3, drawW - 6, drawH - 6, r - 3);
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.stroke();
    }

    animationFrameRef.current = requestAnimationFrame(drawCanvas);
  }, [
    cameraPos,
    cameraShape,
    cameraSize,
    streamConfig.hasCamera,
    isCameraEnabled,
  ]);

  const startRecording = () => {
    if (!canvasRef.current || !screenStreamRef.current) return;

    // 1. Setup Audio Mixing
    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    let hasAudio = false;

    // Add Mic Audio (Only if enabled)
    if (
      cameraStreamRef.current &&
      cameraStreamRef.current.getAudioTracks().length > 0 &&
      isMicEnabled
    ) {
      const micSource = audioContext.createMediaStreamSource(
        cameraStreamRef.current
      );
      micSource.connect(destination);
      hasAudio = true;
    }

    // Add System Audio
    if (screenStreamRef.current.getAudioTracks().length > 0) {
      const sysSource = audioContext.createMediaStreamSource(
        screenStreamRef.current
      );
      sysSource.connect(destination);
      hasAudio = true;
    }

    // 2. Get Canvas Stream
    const canvasStream = canvasRef.current.captureStream(60);

    // 3. Combine Video + Mixed Audio
    const tracks = [...canvasStream.getVideoTracks()];
    if (hasAudio) {
      tracks.push(...destination.stream.getAudioTracks());
    }

    const finalStream = new MediaStream(tracks);

    // 4. Start MediaRecorder
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(finalStream, {
      mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm",
    });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      setRecordingBlob(blob);
      stopStreams();
      if (audioContext.state !== "closed") {
        audioContext.close();
      }
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100); // 100ms chunks

    setIsRecording(true);
    setDuration(0);
    timerIntervalRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    // Start drawing loop
    drawCanvas();
  };

  // Re-start draw loop if config changes while recording/previewing
  useEffect(() => {
    if (streamConfig.hasScreen) {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      drawCanvas();
    }
  }, [drawCanvas, streamConfig.hasScreen]);

  return {
    startStreams,
    stopStreams,
    startRecording,
    stopRecording,
    isRecording,
    recordingBlob,
    duration,
    canvasRef,
    cameraPos,
    setCameraPos,
    cameraShape,
    setCameraShape,
    cameraSize,
    setCameraSize,
    streamConfig,
    setRecordingBlob,
    isMicEnabled,
    toggleMic,
    isCameraEnabled,
    toggleCamera,
  };
};
