// Process an image into a hologram
export async function processImageToHologram(
  imageFile: File,
  audioFile?: File | null
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create elements for processing
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not create canvas context"));
      return;
    }

    // Set up the image onload handler
    img.onload = () => {
      try {
        console.log(
          "Image loaded, dimensions:",
          img.naturalWidth,
          "x",
          img.naturalHeight
        );

        // Calculate dimensions for the output canvas
        const outputSize = 800; // Total output size
        const imageSize = Math.floor(outputSize / 4); // Size for each mini image

        // Set canvas dimensions
        canvas.width = outputSize;
        canvas.height = outputSize;

        // Fill with black background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate positions for the four mini images
        // Center each image, leaving space between them
        const positions = [
          // Top (centered horizontally, at the top)
          { x: (outputSize - imageSize) / 2, y: outputSize / 16 },
          // Right (at the right edge, centered vertically)
          {
            x: outputSize - outputSize / 16 - imageSize,
            y: (outputSize - imageSize) / 2,
          },
          // Bottom (centered horizontally, at the bottom)
          {
            x: (outputSize - imageSize) / 2,
            y: outputSize - outputSize / 16 - imageSize,
          },
          // Left (at the left edge, centered vertically)
          { x: outputSize / 16, y: (outputSize - imageSize) / 2 },
        ];

        // Draw each mini image at its position with proper rotation
        positions.forEach((pos, index) => {
          ctx.save();

          // Translate to the center of where the image will be drawn
          ctx.translate(
            pos.x + imageSize / 2,
            pos.y + imageSize / 2
          );

          // Apply the appropriate transformations based on position
          // All images will be rotated for proper reflection in the pyramid
          switch (index) {
            case 0: // Top
              // Top image needs 180 degree rotation
              ctx.rotate(Math.PI);
              break;
            case 1: // Right
              // Right image needs 270 degree rotation
              ctx.rotate(Math.PI * 1.5);
              break;
            case 2: // Bottom
              // Bottom image needs no rotation (0 degrees)
              // ctx.rotate(0);
              break;
            case 3: // Left
              // Left image needs 90 degree rotation
              ctx.rotate(Math.PI * 0.5);
              break;
          }

          // Draw the image centered around the translation point
          ctx.drawImage(
            img,
            -imageSize / 2,
            -imageSize / 2,
            imageSize,
            imageSize
          );

          ctx.restore();
        });

        // Convert canvas to Blob and return it
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log("Hologram image generated successfully");
              resolve(blob);
            } else {
              reject(new Error("Failed to create image blob"));
            }
          },
          "image/jpeg",
          0.95
        );
      } catch (error) {
        console.error("Error processing image:", error);
        reject(error);
      }
    };

    // Error handler
    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    // Load the image from the file
    img.src = URL.createObjectURL(imageFile);
  });
}

// File이나 Blob을 Base64 데이터 URL로 읽기
export function readFileAsDataURL(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Process a video or GIF into a 4-quadrant hologram format
export async function processVideoToHologram(
  videoFile: File,
  audioFile?: File | null
): Promise<Blob> {
  // GIF 파일인 경우 HTML 페이지로 처리
  if (videoFile.type.includes("gif")) {
    console.log("GIF 파일을 4면 홀로그램으로 변환합니다");
    
    if (audioFile) {
      console.log("GIF와 함께 오디오도 처리합니다");
    }
    
    try {
      // GIF를 Base64로 변환
      const gifBase64 = await readFileAsDataURL(videoFile);
      
      // 홀로그램 크기 설정
      const outputSize = 800;
      const gifSize = Math.floor(outputSize / 3);

      // 각 위치 계산
      const positions = [
        { x: (outputSize - gifSize) / 2, y: outputSize / 16 }, // 위쪽
        { x: outputSize - outputSize / 16 - gifSize, y: (outputSize - gifSize) / 2 }, // 오른쪽
        { x: (outputSize - gifSize) / 2, y: outputSize - outputSize / 16 - gifSize }, // 아래쪽
        { x: outputSize / 16, y: (outputSize - gifSize) / 2 }, // 왼쪽
      ];

      // 오디오 처리 (선택 사항)
      let audioData = null;
      let audioType = '';
      
      if (audioFile) {
        try {
          audioData = await readFileAsDataURL(audioFile);
          audioType = audioFile.type;
        } catch (error) {
          console.error("오디오 파일 변환 오류:", error);
          // 오디오 오류가 있어도 계속 진행
        }
      }
      
      // 오디오 관련 태그 생성
      const audioSrc = audioData ? `<source src="${audioData}" type="${audioType}">` : '';
      const hasAudio = !!audioData;
      
      // HTML 생성
      const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Hologram Display</title>
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            background: black;
            overflow: hidden;
          }
          .container {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            width: 800px;
            height: 800px;
            background: black;
            overflow: visible;
          }
          .gif {
            position: absolute;
            width: ${gifSize}px;
            height: ${gifSize}px;
            object-fit: contain;
            transform-origin: center center;
            image-rendering: optimizeQuality;
            /* GIF 애니메이션이 항상 작동하도록 설정 */
            animation-play-state: running !important;
            pointer-events: none;
          }
          .top {
            top: ${positions[0].y}px;
            left: ${positions[0].x}px;
            transform: rotate(180deg);
          }
          .right {
            top: ${positions[1].y}px;
            left: ${positions[1].x}px;
            transform: rotate(270deg);
          }
          .bottom {
            top: ${positions[2].y}px;
            left: ${positions[2].x}px;
          }
          .left {
            top: ${positions[3].y}px;
            left: ${positions[3].x}px;
            transform: rotate(90deg);
          }
          /* 컨트롤러를 위한 추가 스타일 */
          .audio-controls {
            position: fixed;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: none; /* 다운로드한 버전에서만 표시 */
            background: rgba(0,0,0,0.7);
            padding: 5px 10px;
            border-radius: 20px;
            z-index: 1000;
          }
          .audio-button {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            margin: 0 5px;
            outline: none;
          }
          /* HTML 파일로 저장했을 때만 컨트롤러 표시 */
          @media not all and (hover: hover) {
            .audio-controls {
              display: flex;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img src="${gifBase64}" class="gif top" alt="top">
          <img src="${gifBase64}" class="gif right" alt="right">
          <img src="${gifBase64}" class="gif bottom" alt="bottom">
          <img src="${gifBase64}" class="gif left" alt="left">
        </div>
        
        <!-- 다운로드한 HTML에서 사용할 오디오 플레이어 (iframe에서는 숨김) -->
        <audio id="audio-player" loop style="display:none;">
          ${audioSrc}
        </audio>
        
        <!-- 오디오 컨트롤러 -->
        <div class="audio-controls" id="audio-controls" ${!hasAudio ? 'style="display:none"' : ''}>
          <button class="audio-button" id="play-pause-btn">▶️</button>
          <button class="audio-button" id="mute-btn">🔊</button>
        </div>
        
        <script>
          // iframe과 독립 HTML 환경에서 모두 작동하는 스크립트
          window.addEventListener('DOMContentLoaded', function() {
            const hasAudio = ${hasAudio};
            
            // iframe에서 음악 재생을 위한 메시지 리스너
            window.addEventListener('message', function(event) {
              if (event.data && event.data.type === 'audio-command') {
                handleAudioCommand(event.data);
              }
            });
            
            // 다운로드한 HTML 파일에서 오디오 조작을 위한 설정
            if (window.location.protocol === 'file:') {
              setupStandaloneAudio();
            }
            
            // 오디오가 있는 경우 로드 및 실행 준비 알림
            if (hasAudio) {
              const audioPlayer = document.getElementById('audio-player');
              if (audioPlayer) {
                audioPlayer.addEventListener('canplaythrough', function() {
                  // 부모 iframe에 로드 완료 알림 (있는 경우)
                  if (window !== parent) {
                    parent.postMessage({ type: 'audio-ready' }, '*');
                  }
                  
                  // 독립 실행일 경우 자동 재생
                  if (window.location.protocol === 'file:') {
                    audioPlayer.play().catch(function(err) {
                      console.warn('자동 재생 실패:', err);
                    });
                  }
                });
              }
            }
          });
          
          // iframe에서 보낸 메시지 처리
          function handleAudioCommand(data) {
            const audioPlayer = document.getElementById('audio-player');
            if (!audioPlayer) return;
            
            switch (data.command) {
              case 'load':
                if (data.src) {
                  audioPlayer.src = data.src;
                  audioPlayer.load();
                }
                break;
              case 'play':
                audioPlayer.play().catch(function(err) {
                  console.warn('오디오 재생 오류:', err);
                });
                break;
              case 'pause':
                audioPlayer.pause();
                break;
              case 'volume':
                if (typeof data.value === 'number') {
                  audioPlayer.volume = data.value;
                }
                break;
              case 'mute':
                audioPlayer.muted = !!data.value;
                break;
            }
          }
          
          // 독립 실행 HTML 파일을 위한 설정
          function setupStandaloneAudio() {
            const controls = document.getElementById('audio-controls');
            const playPauseBtn = document.getElementById('play-pause-btn');
            const muteBtn = document.getElementById('mute-btn');
            const audioPlayer = document.getElementById('audio-player');
            
            if (!audioPlayer || !audioPlayer.src) {
              if (controls) controls.style.display = 'none';
              return;
            }
            
            if (controls) controls.style.display = 'flex';
            
            if (playPauseBtn && audioPlayer) {
              playPauseBtn.addEventListener('click', function() {
                if (audioPlayer.paused) {
                  audioPlayer.play();
                  playPauseBtn.textContent = '⏸️';
                } else {
                  audioPlayer.pause();
                  playPauseBtn.textContent = '▶️';
                }
              });
            }
            
            if (muteBtn && audioPlayer) {
              muteBtn.addEventListener('click', function() {
                audioPlayer.muted = !audioPlayer.muted;
                muteBtn.textContent = audioPlayer.muted ? '🔇' : '🔊';
              });
            }
          }
        </script>
      </body>
      </html>`;
      
      // HTML을 Blob으로 변환하고 반환
      return new Blob([html], { type: "text/html" });
      
    } catch (error) {
      console.error("GIF 변환 중 오류 발생:", error);
      throw error; // 상위로 오류 전파
    }
  }

  // 일반 비디오 처리 로직
  return new Promise((resolve, reject) => {
    // Create elements for processing
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not create canvas context"));
      return;
    }

    // Create a MediaRecorder to capture the canvas output
    let mediaRecorder: MediaRecorder | null = null;
    const chunks: BlobPart[] = [];

    // Set up the video element
    video.muted = true;
    video.playsInline = true;

    // Load video metadata
    video.addEventListener("loadedmetadata", () => {
      try {
        console.log(
          "Video loaded, dimensions:",
          video.videoWidth,
          "x",
          video.videoHeight,
        );

        // Calculate dimensions for the output canvas
        const outputSize = 800; // Total output size

        // Set canvas dimensions
        canvas.width = outputSize;
        canvas.height = outputSize;

        // Calculate the size for each mini video - much larger now
        const miniVideoSize = Math.floor(outputSize / 4); // Larger size for each video

        // Set video duration to capture (limit to 20 seconds if longer)
        const duration = Math.min(video.duration, 20);
        console.log(
          "Video duration:",
          duration,
          "seconds (limited to 20 seconds max)",
        );

        // Play the video to start processing
        video.currentTime = 0;

        // Only start recording once the video is playing
        video.addEventListener("play", () => {
          console.log("Video started playing, starting recorder");

          // Setup media recorder with better options
          try {
            const stream = canvas.captureStream(30); // 30fps
            const options = {
              mimeType: "video/webm;codecs=vp9",
              videoBitsPerSecond: 5000000, // 5Mbps
            };

            mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) {
                chunks.push(e.data);
              }
            };

            mediaRecorder.onstop = () => {
              console.log("MediaRecorder stopped, creating blob");
              const blob = new Blob(chunks, { type: "video/webm" });
              resolve(blob);
            };

            mediaRecorder.start();
            console.log("MediaRecorder started");

            // Draw function that creates the hologram effect
            const drawHologramFrame = () => {
              // Fill with black background
              ctx.fillStyle = "black";
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              // Calculate positions for the four mini videos with more spacing between them
              const positions = [
                // Top (centered horizontally, at the top)
                { x: (outputSize - miniVideoSize) / 2, y: outputSize / 16 },
                // Right (at the right, centered vertically)
                {
                  x: outputSize - outputSize / 16 - miniVideoSize,
                  y: (outputSize - miniVideoSize) / 2,
                },
                // Bottom (centered horizontally, at the bottom)
                {
                  x: (outputSize - miniVideoSize) / 2,
                  y: outputSize - outputSize / 16 - miniVideoSize,
                },
                // Left (at the left, centered vertically)
                { x: outputSize / 16, y: (outputSize - miniVideoSize) / 2 },
              ];

              // Draw each mini video at its position with proper rotation and flipping
              positions.forEach((pos, index) => {
                ctx.save();

                // Translate to the center of where the video will be drawn
                ctx.translate(
                  pos.x + miniVideoSize / 2,
                  pos.y + miniVideoSize / 2,
                );

                // Apply the appropriate transformations based on position
                // All images will be rotated 180 degrees for proper reflection in the pyramid
                switch (index) {
                  case 0: // Top
                    // Top: rotate to point to center = 180° + additional 180° for reflection = 360° = 0°
                    // No rotation needed as 360° is the same as 0°
                    break;
                  case 1: // Right
                    // Right: rotate 90° counter-clockwise to point to center + 180° for reflection
                    ctx.rotate(-Math.PI / 2 + Math.PI);
                    break;
                  case 2: // Bottom
                    // Bottom is already pointing to center + 180° for reflection
                    ctx.rotate(Math.PI);
                    break;
                  case 3: // Left
                    // Left: rotate 90° clockwise to point to center + 180° for reflection
                    ctx.rotate(Math.PI / 2 + Math.PI);
                    break;
                }

                // Draw the video centered around the translation point
                ctx.drawImage(
                  video,
                  -miniVideoSize / 2,
                  -miniVideoSize / 2,
                  miniVideoSize,
                  miniVideoSize,
                );

                ctx.restore();
              });

              // Continue drawing frames until the video ends or we reach our duration limit
              if (
                !video.paused &&
                !video.ended &&
                video.currentTime < duration
              ) {
                requestAnimationFrame(drawHologramFrame);
              } else {
                console.log("Video processing finished, stopping recorder");
                // Video finished, stop recording after a short delay to ensure we capture everything
                setTimeout(() => {
                  if (mediaRecorder && mediaRecorder.state !== "inactive") {
                    mediaRecorder.stop();
                  }
                }, 100);
              }
            };

            // Start the drawing loop
            drawHologramFrame();
          } catch (err) {
            console.error("MediaRecorder error:", err);
            reject(err);
          }
        });

        // Start playing the video
        video.play().catch((err) => {
          console.error("Error playing video:", err);
          reject(err);
        });
      } catch (error) {
        console.error("Processing error:", error);
        reject(error);
      }
    });

    video.addEventListener("error", (e) => {
      console.error("Video loading error:", e);
      reject(new Error("Failed to load video"));
    });

    // Load the video from the file
    video.src = URL.createObjectURL(videoFile);
  });
}

// Create a data URL from a media blob
export function createDataUrl(blob: Blob): Promise<string> {
  return readFileAsDataURL(blob);
}

// Check if a file is an image (excluding GIF which will be treated as video)
export function isImage(file: File): boolean {
  return file.type.startsWith("image/") && !file.type.includes("gif");
}

// Check if a file is a video or animated GIF
export function isVideo(file: File): boolean {
  return file.type.startsWith("video/") || file.type.includes("gif");
}

// Check if a file is audio
export function isAudio(file: File): boolean {
  return file.type.startsWith("audio/");
}

// Get file size in a human-readable format
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}