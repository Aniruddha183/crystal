"use client";
import React, { useState } from "react";
import { Background } from "./Background";
import { LandingPage } from "./LandingPage";
import { AppState, CameraPosition, CameraShape } from "../types";
import { useRecorder } from "@/hooks/useRecorder";

import {
  Square,
  Download,
  RotateCcw,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Film,
  Circle,
  RectangleHorizontal,
  Minus,
  Plus,
  X,
  Aperture,
} from "lucide-react";
import { useRouter } from "next/navigation";

const RecorderApp: React.FC = () => {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);

  const {
    startStreams,
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
  } = useRecorder();

  const handleStartSetup = async () => {
    const success = await startStreams();
    if (success) {
      setAppState(AppState.PREVIEW);
    }
  };

  const handleRecord = () => {
    startRecording();
    setAppState(AppState.RECORDING);
  };

  const handleStop = () => {
    stopRecording();
    setAppState(AppState.FINISHED);
  };

  const handleRetake = () => {
    // setRecordingBlob(null);
    // handleStartSetup(); // Restart streams
    window.location.reload();
  };

  const handleCancel = () => {
    stopRecording();
    setAppState(AppState.IDLE);
  };

  const handleDownload = () => {
    if (!recordingBlob) return;
    const url = URL.createObjectURL(recordingBlob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = `crystal-loom-recording-${new Date().toISOString()}.webm`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen text-white relative font-sans selection:bg-white/20">
      <Background />

      {/* Header - Only show simple header on internal pages, LandingPage has its own */}
      {appState !== AppState.IDLE && (
        <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-50 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
              <Aperture className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white block leading-none">
                Crystal
              </span>
            </div>
          </div>

          <div className="pointer-events-auto flex items-center gap-4">
            {isRecording && (
              <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-neutral-900/80 border border-red-500/20 backdrop-blur-md shadow-[0_0_20px_-5px_rgba(220,38,38,0.4)]">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                <span className="font-mono text-sm font-medium tracking-wider text-red-400">
                  {formatTime(duration)}
                </span>
              </div>
            )}

            {appState === AppState.PREVIEW && (
              <button
                onClick={handleCancel}
                className="p-2 rounded-full bg-neutral-900 border border-white/10 hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main Content */}
      {appState === AppState.IDLE ? (
        <LandingPage onStart={handleStartSetup} />
      ) : (
        <main className="container mx-auto px-4 min-h-screen flex flex-col items-center justify-center relative z-10">
          {/* PREVIEW & RECORDING STATE */}
          {(appState === AppState.PREVIEW ||
            appState === AppState.RECORDING) && (
            <div className="w-full max-w-6xl flex flex-col items-center gap-6 animate-fade-in-up">
              {/* The Stage */}
              <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-panel shadow-2xl border-white/5 bg-black/80 group">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-contain"
                />
                {appState === AppState.PREVIEW && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="px-6 py-3 bg-neutral-900/60 backdrop-blur-md rounded-full text-sm font-medium text-white/50 border border-white/5 flex items-center gap-2">
                      Ready to capture
                    </div>
                  </div>
                )}
              </div>

              {/* MONOCHROME Control Bar */}
              <div className="w-full max-w-4xl glass-panel rounded-[24px] p-2 flex flex-col md:flex-row items-center justify-between gap-4 relative">
                {/* Left Section: Inputs */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-center md:justify-start">
                  <button
                    onClick={toggleMic}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl min-w-[100px] justify-center transition-all duration-300 ${
                      isMicEnabled
                        ? "bg-neutral-800 text-white hover:bg-neutral-700"
                        : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    }`}
                  >
                    {isMicEnabled ? (
                      <Mic className="w-4 h-4" />
                    ) : (
                      <MicOff className="w-4 h-4" />
                    )}
                    <span className="text-xs font-semibold">
                      {isMicEnabled ? "MIC ON" : "MIC OFF"}
                    </span>
                  </button>

                  <button
                    onClick={toggleCamera}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl min-w-[100px] justify-center transition-all duration-300 ${
                      isCameraEnabled
                        ? "bg-neutral-800 text-white hover:bg-neutral-700"
                        : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    }`}
                  >
                    {isCameraEnabled ? (
                      <Video className="w-4 h-4" />
                    ) : (
                      <VideoOff className="w-4 h-4" />
                    )}
                    <span className="text-xs font-semibold">
                      {isCameraEnabled ? "CAM ON" : "CAM OFF"}
                    </span>
                  </button>
                </div>

                {/* Center Section: Composition Controls */}
                <div
                  className={`flex items-center gap-4 px-4 border-l border-r border-white/5 transition-opacity duration-300 ${
                    !isCameraEnabled
                      ? "opacity-20 pointer-events-none"
                      : "opacity-100"
                  }`}
                >
                  {/* Position Grid */}
                  <div className="grid grid-cols-2 gap-1 p-1">
                    {[
                      CameraPosition.TOP_LEFT,
                      CameraPosition.TOP_RIGHT,
                      CameraPosition.BOTTOM_LEFT,
                      CameraPosition.BOTTOM_RIGHT,
                    ].map((pos) => (
                      <button
                        key={pos}
                        onClick={() => setCameraPos(pos)}
                        className={`w-5 h-4 rounded-[2px] border border-white/10 transition-all ${
                          cameraPos === pos
                            ? "bg-white"
                            : "bg-transparent hover:bg-white/20"
                        }`}
                      ></button>
                    ))}
                  </div>

                  {/* Shape Toggle */}
                  <div className="flex bg-neutral-900 rounded-lg p-1 border border-white/5">
                    <button
                      onClick={() => setCameraShape(CameraShape.CIRCLE)}
                      className={`p-2 rounded-md transition-all ${
                        cameraShape === CameraShape.CIRCLE
                          ? "bg-neutral-700 text-white shadow-sm"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCameraShape(CameraShape.RECTANGLE)}
                      className={`p-2 rounded-md transition-all ${
                        cameraShape === CameraShape.RECTANGLE
                          ? "bg-neutral-700 text-white shadow-sm"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      <RectangleHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Size Slider */}
                  <div className="flex items-center gap-3 w-32">
                    <button
                      onClick={() =>
                        setCameraSize(Math.max(0.5, cameraSize - 0.1))
                      }
                      className="text-neutral-500 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <div className="relative flex-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="absolute h-full bg-white rounded-full"
                        style={{
                          width: `${((cameraSize - 0.5) / 1.5) * 100}%`,
                        }}
                      ></div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={cameraSize}
                        onChange={(e) =>
                          setCameraSize(parseFloat(e.target.value))
                        }
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={() =>
                        setCameraSize(Math.min(2.0, cameraSize + 0.1))
                      }
                      className="text-neutral-500 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Right Section: Action */}
                <div className="w-full md:w-auto flex justify-end">
                  {appState === AppState.PREVIEW ? (
                    <button
                      onClick={handleRecord}
                      className="group relative px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-900/20 transition-all flex items-center gap-2 overflow-hidden"
                    >
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span className="tracking-wide text-sm">REC</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStop}
                      className="px-6 py-3 bg-white text-black hover:bg-neutral-200 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2"
                    >
                      <Square className="w-3 h-3 fill-current" />
                      <span className="tracking-wide text-sm">STOP</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* FINISHED STATE */}
          {appState === AppState.FINISHED && (
            <div className="w-full max-w-5xl flex flex-col items-center gap-8 animate-fade-in-up py-10">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  Recording Complete
                </h2>
                <p className="text-neutral-500">
                  Your session has been captured successfully.
                </p>
              </div>

              <div className="relative w-full aspect-video rounded-3xl overflow-hidden glass-panel border-white/10 shadow-2xl bg-black">
                {recordingBlob && (
                  <video
                    src={URL.createObjectURL(recordingBlob)}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button
                  onClick={handleRetake}
                  className="px-8 py-4 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 transition-all font-medium flex items-center gap-3 w-full sm:w-auto justify-center"
                >
                  <RotateCcw className="w-4 h-4" />
                  Discard
                </button>

                <button
                  onClick={handleDownload}
                  className="px-8 py-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold flex items-center gap-3 shadow-lg shadow-white/10 transition-all w-full sm:w-auto justify-center"
                >
                  <Download className="w-4 h-4" />
                  Download Video
                </button>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
};

export default RecorderApp;
