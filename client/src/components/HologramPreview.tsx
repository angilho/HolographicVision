import React, { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  FilePlus,
  FileDown,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
} from "lucide-react";
import { isVideo, isAudio } from "@/lib/hologramProcessor";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

interface HologramPreviewProps {
  processedMedia: string;
  mediaType: "image" | "video";
  audioFile: File | null;
  onCreateNew: () => void;
}

const HologramPreview: React.FC<HologramPreviewProps> = ({
  processedMedia,
  mediaType,
  audioFile,
  onCreateNew,
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [scale, setScale] = useState(100); // 100% scale by default
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioProgressInterval = useRef<number | null>(null);

  // GIF 모드의 iframe 참조
  const gifIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Handle audio playback - including GIF iframe audio
  const toggleAudio = () => {
    if (!audioRef.current) {
      console.error("No audio reference available");
      return;
    }

    try {
      if (isAudioPlaying) {
        // PAUSE CASE
        console.log("Pausing audio");
        audioRef.current.pause();

        // If we have video, pause it too
        if (videoRef.current && mediaType === "video") {
          videoRef.current.pause();
          setVideoPlaying(false);
        }
        
        // GIF iframe에도 오디오 일시정지 메시지 전송
        if (processedMedia.startsWith("data:text/html") && gifIframeRef.current) {
          gifIframeRef.current.contentWindow?.postMessage({
            type: 'audio-command',
            command: 'pause'
          }, '*');
          console.log("GIF iframe 오디오 일시정지 요청 전송");
        }

        setIsAudioPlaying(false);
      } else {
        // PLAY CASE
        console.log("Attempting to play audio");

        // Reset audio position if it's at the end
        if (audioRef.current.currentTime >= audioRef.current.duration) {
          audioRef.current.currentTime = 0;
        }

        // Sync with video if applicable
        if (videoRef.current && mediaType === "video") {
          audioRef.current.currentTime = videoRef.current.currentTime || 0;
        }

        // Set muted state based on user preference
        audioRef.current.muted = isAudioMuted;

        console.log("Playing audio now");
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio started playing successfully");
              setIsAudioPlaying(true);
              
              // GIF iframe에도 오디오 재생 메시지 전송
              if (processedMedia.startsWith("data:text/html") && gifIframeRef.current) {
                gifIframeRef.current.contentWindow?.postMessage({
                  type: 'audio-command',
                  command: 'play'
                }, '*');
                console.log("GIF iframe 오디오 재생 요청 전송");
              }

              // Sync video playback with audio
              if (videoRef.current && mediaType === "video" && !videoPlaying) {
                // Ensure video time matches audio time
                videoRef.current.currentTime =
                  audioRef.current?.currentTime || 0;

                videoRef.current
                  .play()
                  .then(() => {
                    console.log("Video synchronized with audio");
                    setVideoPlaying(true);
                  })
                  .catch((e) => {
                    console.error("Error playing video with audio:", e);
                    toast({
                      title: "비디오 동기화 오류",
                      description:
                        "오디오는 재생되지만 비디오 동기화에 문제가 있습니다.",
                      variant: "destructive",
                    });
                  });
              }
            })
            .catch((error) => {
              console.error("Error playing audio:", error);

              toast({
                title: "오디오 재생 오류",
                description:
                  "브라우저에서 오디오 재생에 문제가 있습니다. 직접 비디오를 클릭하여 재생해보세요.",
                variant: "destructive",
              });

              // If audio fails but we have video, try playing the video directly
              if (videoRef.current && mediaType === "video" && !videoPlaying) {
                videoRef.current.muted = true; // Mute video initially since audio failed
                videoRef.current
                  .play()
                  .then(() => {
                    setVideoPlaying(true);
                    toast({
                      title: "비디오만 재생됩니다",
                      description:
                        "오디오 없이 비디오만 재생됩니다. 브라우저 권한을 확인해주세요.",
                      variant: "default",
                    });
                  })
                  .catch((e) => console.error("Fallback video play error:", e));
              }

              setIsAudioPlaying(false);
            });
        } else {
          console.log("Play promise was undefined");
          setIsAudioPlaying(true);

          // Try to play video as well
          if (videoRef.current && mediaType === "video" && !videoPlaying) {
            videoRef.current
              .play()
              .catch((e) => console.error("Error syncing video:", e));
            setVideoPlaying(true);
          }
        }
      }
    } catch (error) {
      console.error("Toggle audio error:", error);
      toast({
        title: "오디오 재생 오류",
        description: "오디오 재생 중 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // Toggle audio mute
  const toggleMute = () => {
    if (!audioRef.current) return;

    const newMutedState = !isAudioMuted;
    audioRef.current.muted = newMutedState;
    setIsAudioMuted(newMutedState);
    
    // GIF iframe에도 음소거 상태 전달
    if (processedMedia.startsWith("data:text/html") && gifIframeRef.current) {
      gifIframeRef.current.contentWindow?.postMessage({
        type: 'audio-command',
        command: 'mute',
        muted: newMutedState
      }, '*');
      console.log(`GIF iframe 오디오 ${newMutedState ? '음소거' : '음소거 해제'} 요청 전송`);
    }

    toast({
      title: newMutedState ? "음소거 켜짐" : "음소거 해제",
      description: newMutedState
        ? "오디오가 음소거되었습니다."
        : "오디오 음소거가 해제되었습니다.",
      variant: "default",
    });
  };

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Update audio progress
  useEffect(() => {
    if (isAudioPlaying && audioRef.current) {
      audioProgressInterval.current = window.setInterval(() => {
        if (audioRef.current) {
          setAudioProgress(audioRef.current.currentTime);
        }
      }, 100) as unknown as number;
    } else if (audioProgressInterval.current) {
      clearInterval(audioProgressInterval.current);
    }

    return () => {
      if (audioProgressInterval.current) {
        clearInterval(audioProgressInterval.current);
      }
    };
  }, [isAudioPlaying]);

  // Set up audio duration when loaded and auto-play if needed
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleLoadedMetadata = () => {
        setAudioDuration(audio.duration);
        console.log("Audio loaded and ready to play automatically");

        // 미리보기가 준비되면 오디오 자동 재생
        if (audioFile && mediaType === "image") {
          setTimeout(() => {
            if (audioRef.current && !isAudioPlaying) {
              console.log("Auto-playing audio after preview loaded");
              // 직접 오디오 재생 (toggleAudio 함수 대신)
              try {
                if (audioRef.current) {
                  audioRef.current
                    .play()
                    .then(() => {
                      setIsAudioPlaying(true);
                      console.log("Auto-play successful");
                    })
                    .catch((err) => {
                      console.error("Auto-play failed:", err);
                    });
                }
              } catch (err) {
                console.error("Error during auto-play:", err);
              }
            }
          }, 1000); // 1초 후 자동 재생
        }
      };

      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => {
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [audioFile, mediaType, isAudioPlaying]);

  // Handle video synchronization with audio
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;

    if (video && audio && mediaType === "video") {
      const handleVideoEnded = () => {
        if (audio.paused) return;
        audio.pause();
        setIsAudioPlaying(false);
        setVideoPlaying(false);
      };

      const handleAudioEnded = () => {
        if (video.paused) return;
        video.pause();
        setVideoPlaying(false);
        setIsAudioPlaying(false);
      };

      video.addEventListener("ended", handleVideoEnded);
      audio.addEventListener("ended", handleAudioEnded);

      return () => {
        video.removeEventListener("ended", handleVideoEnded);
        audio.removeEventListener("ended", handleAudioEnded);
      };
    }
  }, [mediaType]);

  // Handle download
  const downloadHologram = () => {
    const link = document.createElement("a");

    // HTML 콘텐츠인 경우 (GIF 애니메이션)
    if (processedMedia.startsWith("data:text/html")) {
      link.href = processedMedia;
      link.download = `hologram-${Date.now()}.html`;
    } else {
      // 일반 이미지나 비디오 다운로드
      link.href = processedMedia;
      link.download = `hologram-${Date.now()}.${mediaType === "image" ? "jpg" : "webm"}`;
    }

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download pyramid template
  const downloadTemplate = () => {
    window.open("/pyramid-template.svg", "_blank");
  };

  // Prepare audio URL
  const audioUrl = useMemo(() => {
    return audioFile ? URL.createObjectURL(audioFile) : undefined;
  }, [audioFile]);

  // Handle video play/pause directly
  const handleVideoToggle = () => {
    if (!videoRef.current) return;

    if (videoPlaying) {
      videoRef.current.pause();
      setVideoPlaying(false);

      // Also pause audio if it's playing
      if (audioRef.current && isAudioPlaying) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    } else {
      const playPromise = videoRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setVideoPlaying(true);
            console.log("Video started playing directly");

            // Also play audio if available
            if (audioFile && audioRef.current && !isAudioPlaying) {
              audioRef.current.currentTime = videoRef.current?.currentTime || 0;
              audioRef.current
                .play()
                .then(() => {
                  setIsAudioPlaying(true);
                  console.log("Audio synchronized with video");
                })
                .catch((e) => {
                  console.error("Error starting audio with video:", e);
                  toast({
                    title: "오디오 재생 실패",
                    description:
                      "비디오는 재생되지만, 오디오 재생에 문제가 있습니다. 다시 시도해주세요.",
                    variant: "default",
                  });
                });
            }
          })
          .catch((e) => {
            console.error("Error playing video directly:", e);
            toast({
              title: "비디오 재생 오류",
              description: "비디오 재생에 문제가 있습니다. 다시 시도해주세요.",
              variant: "destructive",
            });
          });
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Scale Controls - 미리보기 화면 밖으로 이동 */}
      <div className="lg:col-span-3 px-4 py-3 bg-gray-100 rounded-lg border border-gray-200 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium">화면 크기 조정</span>
          <span className="text-sm font-medium">{scale}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <ZoomOut className="h-4 w-4 text-gray-600" />
          <Slider
            className="flex-1"
            value={[scale]}
            min={50}
            max={150}
            step={5}
            onValueChange={(value) => setScale(value[0])}
          />
          <ZoomIn className="h-4 w-4 text-gray-600" />
        </div>
      </div>

      {/* Hologram Display preview */}
      <div className="lg:col-span-3 bg-black p-4 rounded-lg relative">
        {/* Hologram display */}
        <div className="aspect-square relative mx-auto max-w-lg overflow-hidden">
          {/* HTML 콘텐츠인 경우 iframe으로 직접 표시 (GIF 애니메이션용) */}
          {processedMedia.startsWith("data:text/html") ? (
            <div className="w-full h-full flex items-center justify-center">
              <iframe
                ref={(iframe) => {
                  // iframe 참조 저장
                  gifIframeRef.current = iframe;
                  
                  // iframe이 로드되면 오디오 통합 스크립트 작동
                  if (iframe && audioFile) {
                    iframe.onload = () => {
                      try {
                        // iframe과 소통할 수 있도록 sandbox에 allow-scripts 추가 필요
                        console.log("GIF iframe 로드됨, 오디오 설정 중...");
                        
                        // 오디오 URL 생성
                        const audioUrl = URL.createObjectURL(audioFile);
                        
                        // iframe에 오디오 로드 메시지 전송
                        setTimeout(() => {
                          iframe.contentWindow?.postMessage({
                            type: 'audio-command',
                            command: 'load',
                            src: audioUrl
                          }, '*');
                          
                          // 오디오 자동 재생 설정
                          setTimeout(() => {
                            if (audioFile) {
                              iframe.contentWindow?.postMessage({
                                type: 'audio-command',
                                command: 'play'
                              }, '*');
                              setIsAudioPlaying(true);
                              console.log("GIF와 함께 오디오 자동재생 시작");
                            }
                          }, 1000);
                        }, 1000);
                      } catch (e) {
                        console.error("iframe에 오디오 전송 오류:", e);
                      }
                    };
                  }
                }}
                src={processedMedia}
                className="w-full h-full border-0 overflow-hidden bg-black"
                style={{
                  transform: `scale(${scale / 150})`,
                  width: "200%",
                  height: "200%",
                  minHeight: "500px",
                  maxHeight: "800px",
                  aspectRatio: "1/1",
                  display: "block",
                  margin: "0 auto",
                  position: "relative",
                }}
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
          ) : mediaType === "image" ? (
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={processedMedia}
                alt="Hologram display"
                className="object-contain transition-transform duration-300"
                style={{ transform: `scale(${scale / 100})` }}
              />
            </div>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center">
              <video
                ref={videoRef}
                src={processedMedia}
                className="object-contain transition-transform duration-300"
                style={{ transform: `scale(${scale / 100})` }}
                loop
                muted={!audioFile || isAudioMuted} // Mute video if we're using separate audio or user muted
                playsInline
                controls={!audioFile} // Only show controls if there's no audio (otherwise use our custom controls)
                onCanPlay={() => {
                  console.log("Video can play now");
                  // Let user control video playback if there's an audio file
                  if (videoRef.current && !audioFile) {
                    videoRef.current
                      .play()
                      .catch((e) => console.error("Video autoplay error:", e));
                  }
                }}
                onPlay={() => {
                  console.log("Video playing event triggered");
                  setVideoPlaying(true);

                  // Sync audio if it exists and isn't already playing
                  if (audioRef.current && audioFile && !isAudioPlaying) {
                    toggleAudio();
                  }
                }}
                onPause={() => {
                  console.log("Video paused event triggered");
                  setVideoPlaying(false);

                  // Pause audio if it's playing
                  if (audioRef.current && isAudioPlaying) {
                    audioRef.current.pause();
                    setIsAudioPlaying(false);
                  }
                }}
                onClick={audioFile ? handleVideoToggle : undefined}
              />
            </div>
          )}
        </div>

        {/* Audio Player - only show if we have an audio file AND we're showing an image or GIF */}
        {audioFile && mediaType === "image" && (
          <div className="mt-4 flex justify-center">
            <div className="bg-gray-800 rounded-full px-4 py-2 flex items-center space-x-3">
              <button
                className="text-white hover:text-primary focus:outline-none"
                onClick={toggleAudio}
              >
                {isAudioPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </button>
              <div
                className="w-48 sm:w-64 bg-gray-600 h-1 rounded-full relative cursor-pointer"
                onClick={(e) => {
                  if (!audioRef.current || audioDuration === 0) return;

                  // Get click position relative to the progress bar
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickPosition = (e.clientX - rect.left) / rect.width;

                  // Set new time position
                  const newTime = clickPosition * audioDuration;
                  audioRef.current.currentTime = newTime;
                  setAudioProgress(newTime);

                  // Also synchronize video if it exists
                  const videoElement = videoRef.current;
                  // Avoid direct type comparison by checking if it's not an image
                  if (videoElement && !mediaType.includes("image")) {
                    videoElement.currentTime = newTime;
                  }

                  console.log("Seek to:", newTime);

                  // If not playing, start playback
                  if (!isAudioPlaying) {
                    toggleAudio();
                  }
                }}
              >
                <div
                  className="bg-primary h-1 rounded-full"
                  style={{ width: `${(audioProgress / audioDuration) * 100}%` }}
                ></div>
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-md"
                  style={{
                    left: `calc(${(audioProgress / audioDuration) * 100}% - 5px)`,
                    display: audioDuration > 0 ? "block" : "none",
                  }}
                ></div>
              </div>
              <span className="text-xs text-white">
                {formatTime(audioProgress)}
              </span>
              <button
                className="text-white hover:text-primary focus:outline-none"
                onClick={toggleMute}
                title={isAudioMuted ? "음소거 해제" : "음소거"}
              >
                {isAudioMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              src={audioFile ? URL.createObjectURL(audioFile) : undefined}
              onEnded={() => setIsAudioPlaying(false)}
              onLoadedMetadata={() =>
                console.log(
                  "Audio loaded, duration:",
                  audioRef.current?.duration,
                )
              }
              onPlay={() => console.log("Audio started playing")}
              onPause={() => console.log("Audio paused")}
              onError={(e) => console.error("Audio error:", e)}
              preload="auto"
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Preview Controls */}
      <div className="lg:col-span-2">
        <div className="bg-gray-100 p-6 rounded-lg h-full">
          <h3 className="text-xl font-semibold mb-4">Your Hologram is Ready</h3>
          <p className="text-gray-600 mb-6">
            Here's how to use your hologram projection:
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                <span>1</span>
              </div>
              <p className="ml-3 text-gray-600">Download your hologram video</p>
            </div>

            <div className="flex items-start">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                <span>2</span>
              </div>
              <p className="ml-3 text-gray-600">
                Create a simple pyramid using clear plastic and the template
              </p>
            </div>

            <div className="flex items-start">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                <span>3</span>
              </div>
              <p className="ml-3 text-gray-600">
                Place the pyramid on your device with the video playing
              </p>
            </div>

            <div className="flex items-start">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">
                <span>4</span>
              </div>
              <p className="ml-3 text-gray-600">
                화면 크기 조정 슬라이더로 피라미드 크기에 맞게 영상 크기를
                조절하세요
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              className="w-full py-6 bg-emerald-300 hover:bg-emerald-600 h-auto"
              onClick={downloadHologram}
            >
              <Download className="mr-2 h-4 w-4" />
              <span>Download Hologram</span>
            </Button>

            <Button
              className="w-full py-6 bg-gray-200 text-gray-700 hover:bg-gray-300 h-auto"
              onClick={downloadTemplate}
            >
              <FileDown className="mr-2 h-4 w-4" />
              <span>Download Pyramid Template</span>
            </Button>

            <Button
              className="w-full py-6 bg-white text-primary border border-primary hover:bg-blue-50 h-auto"
              onClick={onCreateNew}
              variant="outline"
            >
              <FilePlus className="mr-2 h-4 w-4" />
              <span>Create New Hologram</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HologramPreview;
