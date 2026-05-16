(function() {
    let playerContainer = null;
    let videoElement = null;
    let isLooping = false;
    let savedVideoUrl = ""; 
    let savedFileName = ""; 
    let savedTimeBeforeClose = 0; 

    window.VideoPlayerManager = {
        /**
         * Inicializa o Player de Vídeo Avançado fixado no rodapé
         */
        create: function(sourceUrl, fileName) {
            this.destroyRecoveryButton(); 
            this.destroy();

            const currentFileIdentifier = fileName || "video_stream";

            if (savedFileName !== currentFileIdentifier) {
                savedTimeBeforeClose = 0;
            }

            savedVideoUrl = sourceUrl;
            savedFileName = currentFileIdentifier;

            playerContainer = document.createElement('div');
            playerContainer.id = 'custom-player-container';
            playerContainer.className = 'player-fixed-bottom';
            playerContainer.style.display = 'block';

            playerContainer.innerHTML = [
                '<div class="player-wrapper">',
                    '<!-- Viewport Visual de Renderização -->',
                    '<div id="player-viewport" class="player-video-viewport">',
                        '<video id="custom-video-element" playsinline autoplay src="', sourceUrl, '"></video>',
                    '</div>',
                    '<div class="player-controls" id="player-custom-controls-ui">',
                        '<!-- Barra de Progresso Customizada Original -->',
                        '<div class="custom-progress-bar-container" id="progress-bar-root">',
                            '<div class="progress-bar-buffered" id="progress-buffered"></div>',
                            '<div class="progress-bar-fill" id="progress-fill"></div>',
                            '<div class="progress-bar-handle" id="progress-handle"></div>',
                        '</div>',
                        '<div class="controls-row">',
                            '<div class="controls-left">',
                                '<button id="btn-player-play" aria-label="Play/Pause" class="player-btn">',
                                    '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
                                '</button>',
                                '<button id="btn-player-stop" aria-label="Parar" class="player-btn" title="Parar">',
                                    '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M6 6h12v12H6z"/></svg>',
                                '</button>',
                                '<button id="btn-player-rewind" aria-label="Retroceder 10s" class="player-btn" title="Voltar 10s">',
                                    '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>',
                                '</button>',
                                '<button id="btn-player-forward" aria-label="Avançar 10s" class="player-btn" title="Avançar 10s">',
                                    '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>',
                                </button>',
                                '<button id="btn-player-loop" aria-label="Loop" class="player-btn">',
                                    '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>',
                                '</button>',
                                '<div class="volume-control-wrapper">',
                                    '<button id="btn-player-mute" class="player-btn" aria-label="Mute Toggle">',
                                        '<svg id="icon-volume" viewBox="0 0 24 24" width="18" height="18"></svg>',
                                    '</button>',
                                    '<input type="range" id="volume-slider" min="0" max="1" step="0.05" value="1" class="volume-slider-bar">',
                                '</div>',
                                '<div class="time-display-container">',
                                    '<span id="player-time-display">00:00:00 / 00:00:00</span>',
                                '</div>',
                            '</div>',
                            '<div class="controls-right">',
                                '<div class="select-speed-wrapper">',
                                    '<select id="player-speed-select" aria-label="Velocidade">',
                                        '<option value="0.5">0.50x</option>',
                                        '<option value="0.75">0.75x</option>',
                                        '<option value="1" selected>1.00x</option>',
                                        '<option value="1.25">1.25x</option>',
                                        '<option value="1.5">1.50x</option>',
                                        '<option value="1.75">1.75x</option>',
                                        '<option value="2">2.00x</option>',
                                        '<option value="2.25">2.25x</option>',
                                        '<option value="2.5">2.50x</option>',
                                        '<option value="2.75">2.75x</option>',
                                        '<option value="3">3.00x</option>',
                                    '</select>',
                                '</div>',
                                '<button id="btn-player-lightbox-expand" aria-label="Ampliar no Lightbox" class="player-btn" title="Ampliar Frame no Lightbox">',
                                    '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3h-7z"/></svg>',
                                '</button>',
                                '<button id="btn-player-fullscreen" aria-label="Tela Cheia" class="player-btn" title="Tela Cheia">',
                                    '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',
                                '</button>',
                                '<button id="btn-player-close" aria-label="Fechar" class="player-btn close-btn">',
                                    '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
                                '</button>',
                            '</div>',
                        '</div>',
                    '</div>',
                '</div>'
            ].join('');

            document.body.appendChild(playerContainer);
            videoElement = document.getElementById('custom-video-element');
            videoElement.muted = false;

            videoElement.addEventListener('canplay', function onCanPlayReady() {
                window.VideoPlayerManager.bindEvents();
                window.VideoPlayerManager.loadSavedPlayerSettings();
                
                if (savedTimeBeforeClose > 0) {
                    videoElement.currentTime = savedTimeBeforeClose;
                }
                
                videoElement.play().catch(function() {
                    const btnPlay = playerContainer.querySelector('#btn-player-play');
                    if (btnPlay) btnPlay.innerHTML = svgPlay;
                });
                
                videoElement.removeEventListener('canplay', onCanPlayReady);
            });

            videoElement.load();
        },

        bindEvents: function() {
            if (!videoElement || !playerContainer) return;

            const btnPlay = playerContainer.querySelector('#btn-player-play');
            const btnStop = playerContainer.querySelector('#btn-player-stop');
            const btnRewind = playerContainer.querySelector('#btn-player-rewind');
            const btnForward = playerContainer.querySelector('#btn-player-forward');
            const btnLoop = playerContainer.querySelector('#btn-player-loop');
            const btnMute = playerContainer.querySelector('#btn-player-mute');
            const btnExpandLightbox = playerContainer.querySelector('#btn-player-lightbox-expand');
            const btnFullscreen = playerContainer.querySelector('#btn-player-fullscreen');
            const btnClose = playerContainer.querySelector('#btn-player-close');
            const volumeSlider = playerContainer.querySelector('#volume-slider');
            const speedSelect = playerContainer.querySelector('#player-speed-select');
            const timeDisplay = playerContainer.querySelector('#player-time-display');
            
            const progressRoot = playerContainer.querySelector('#progress-bar-root');
            const progressFill = playerContainer.querySelector('#progress-fill');
            const progressBuffered = playerContainer.querySelector('#progress-buffered');
            const progressHandle = playerContainer.querySelector('#progress-handle');

            const svgPlay = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
            const svgPause = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

            playerContainer.addEventListener('contextmenu', function(event) {
                event.preventDefault();
            });

            const handleFullscreenChange = function() {
                const fsEl = (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
                if (fsEl === playerContainer) {
                    playerContainer.classList.add('fullscreen-mode-active');
                } else {
                    playerContainer.classList.remove('fullscreen-mode-active');
                }
            };

            document.addEventListener('fullscreenchange', handleFullscreenChange);
            document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

            btnPlay.addEventListener('click', function() {
                if (videoElement.paused || videoElement.ended) {
                    videoElement.play().then(function() { btnPlay.innerHTML = svgPause; });
                } else {
                    videoElement.pause();
                    btnPlay.innerHTML = svgPlay;
                }
            });

            btnStop.addEventListener('click', function() {
                videoElement.pause();
                videoElement.currentTime = 0;
                btnPlay.innerHTML = svgPlay;
            });

            btnRewind.addEventListener('click', function() {
                videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
            });

            btnForward.addEventListener('click', function() {
                videoElement.currentTime = Math.min(videoElement.duration, videoElement.currentTime + 10);
            });

            btnLoop.addEventListener('click', function() {
                isLooping = !isLooping;
                videoElement.loop = isLooping;
                btnLoop.classList.toggle('active-control', isLooping);
                localStorage.setItem('player-setting-loop', isLooping ? 'true' : 'false');
            });

            // ATUALIZAÇÃO SOLICITADA: Pausa o vídeo no momento exato do clique e joga no Lightbox
            btnExpandLightbox.addEventListener('click', function() {
                if (!videoElement || !window.LightboxManager) return;
                try {
                    videoElement.pause();
                    if (btnPlay) btnPlay.innerHTML = svgPlay;

                    const canvas = document.createElement('canvas');
                    canvas.width = videoElement.videoWidth || 640;
                    canvas.height = videoElement.videoHeight || 360;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const frameDataUrl = canvas.toDataURL('image/png');
                    
                    window.LightboxManager.open(frameDataUrl, 'player_snapshot');
                } catch(e) {
                    console.error(e);
                }
            });

            btnFullscreen.addEventListener('click', function() {
                if (!playerContainer) return;
                const isCurrentlyFS = (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
                if (!isCurrentlyFS) {
                    if (playerContainer.requestFullscreen) { playerContainer.requestFullscreen(); }
                    else if (playerContainer.webkitRequestFullscreen) { playerContainer.webkitRequestFullscreen(); }
                } else {
                    if (document.exitFullscreen) { document.exitFullscreen(); }
                }
            });

            volumeSlider.addEventListener('input', function(e) {
                const vol = parseFloat(e.target.value);
                videoElement.volume = vol;
                videoElement.muted = (vol === 0);
                window.VideoPlayerManager.updateVolumeIcon();
                localStorage.setItem('player-setting-volume', vol);
                localStorage.setItem('player-setting-muted', vol === 0 ? 'true' : 'false');
            });

            btnMute.addEventListener('click', function() {
                videoElement.muted = !videoElement.muted;
                window.VideoPlayerManager.updateVolumeIcon();
                localStorage.setItem('player-setting-muted', videoElement.muted ? 'true' : 'false');
            });

            videoElement.addEventListener('timeupdate', function() {
                if (!videoElement.duration || isNaN(videoElement.duration)) return;
                const pct = (videoElement.currentTime / videoElement.duration) * 100;
                progressFill.style.width = pct + '%';
                progressHandle.style.left = pct + '%';
                timeDisplay.textContent = window.VideoPlayerManager.formatTime(videoElement.currentTime) + " / " + window.VideoPlayerManager.formatTime(videoElement.duration);
            });

            videoElement.addEventListener('progress', function() {
                if (videoElement.buffered.length > 0 && videoElement.duration) {
                    const bufferedEnd = videoElement.buffered.end(videoElement.buffered.length - 1);
                    const pctBuffered = (bufferedEnd / videoElement.duration) * 100;
                    progressBuffered.style.width = pctBuffered + '%';
                }
            });

            let isDraggingProgress = false;
            const seekMedia = function(clientX) {
                const rect = progressRoot.getBoundingClientRect();
                let pct = (clientX - rect.left) / rect.width;
                pct = Math.min(Math.max(pct, 0), 1);
                videoElement.currentTime = pct * videoElement.duration;
            };

            progressRoot.addEventListener('mousedown', function(e) {
                isDraggingProgress = true;
                seekMedia(e.clientX);
            });

            window.addEventListener('mousemove', function(e) {
                if (isDraggingProgress) seekMedia(e.clientX);
            });

            window.addEventListener('mouseup', function() {
                isDraggingProgress = false;
            });

            speedSelect.addEventListener('change', function(e) {
                const speed = parseFloat(e.target.value);
                videoElement.playbackRate = speed;
                localStorage.setItem('player-setting-speed', speed);
            });

            btnClose.addEventListener('click', function() {
                if (videoElement) { savedTimeBeforeClose = videoElement.currentTime; }
                window.VideoPlayerManager.destroy();
                window.VideoPlayerManager.createRecoveryButton();
            });
        },

        /**
         * INTERFACE DE CONTROLE: Permite que outros scripts retomem a reprodução
         */
        resumePlayback: function() {
            if (!videoElement) return;
            videoElement.play().then(function() {
                const btnPlay = playerContainer.querySelector('#btn-player-play');
                const svgPause = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                if (btnPlay) btnPlay.innerHTML = svgPause;
            }).catch(function(e) {
                console.log("Falha ao retomar vídeo automaticamente:", e);
            });
        },

        updateVolumeIcon: function() {
            if (!videoElement || !playerContainer) return;
            const path = playerContainer.querySelector('#icon-volume');
            if (!path) return;

            const isMuted = videoElement.muted;
            const currentVolume = videoElement.volume;

            if (isMuted || currentVolume === 0) {
                path.innerHTML = '<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.21.05-.42.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
            } else if (currentVolume < 0.5) {
                path.innerHTML = '<path fill="currentColor" d="M12 4L7 9H3v6h4l5 5V4zm2.5 8c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
            } else {
                path.innerHTML = '<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
            }
        },

        loadSavedPlayerSettings: function() {
            if (!videoElement || !playerContainer) return;
            const savedSpeed = localStorage.getItem('player-setting-speed');
            const savedLoop = localStorage.getItem('player-setting-loop');
            const savedVol = localStorage.getItem('player-setting-volume');
            const savedMuted = localStorage.getItem('player-setting-muted');

            if (savedSpeed) {
                playerContainer.querySelector('#player-speed-select').value = savedSpeed;
                videoElement.playbackRate = parseFloat(savedSpeed);
            }
            if (savedLoop === 'true') {
                isLooping = true;
                videoElement.loop = true;
                playerContainer.querySelector('#btn-player-loop').classList.add('active-control');
            }
            if (savedVol !== null) {
                playerContainer.querySelector('#volume-slider').value = savedVol;
                videoElement.volume = parseFloat(savedVol);
            }
            if (savedMuted === 'true') { videoElement.muted = true; }
            else if (savedMuted === 'false') { videoElement.muted = false; }
            
            this.updateVolumeIcon();
        },

        createRecoveryButton: function() {
            if (document.getElementById('btn-player-recovery') || !savedVideoUrl) return;

            const activeLang = document.documentElement.getAttribute('lang') || localStorage.getItem('meta-lang') || 'pt';
            const buttonText = (activeLang.indexOf('en') !== -1) ? 'Open Player' : 'Abrir Player';

            const recBtn = document.createElement('button');
            recBtn.id = 'btn-player-recovery';
            recBtn.className = 'player-recovery-floating-btn';
            recBtn.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" style="margin-right:6px;"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg> ' + buttonText;
            
            recBtn.addEventListener('click', function() {
                window.VideoPlayerManager.create(savedVideoUrl, savedFileName);
            });

            document.body.appendChild(recBtn);
        },

        destroyRecoveryButton: function() {
            const recBtn = document.getElementById('btn-player-recovery');
            if (recBtn && recBtn.parentNode) {
                recBtn.parentNode.removeChild(recBtn);
            }
        },

        formatTime: function(seconds) {
            if (isNaN(seconds) || seconds === Infinity || seconds < 0) return "00:00:00";
            const hrs = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            const secs = Math.floor(seconds % 60);
            const pad = function(n) { return String(n).padStart(2, '0'); };
            return pad(hrs) + ":" + pad(mins) + ":" + pad(secs);
        },

        destroy: function() {
            if (playerContainer && playerContainer.parentNode) {
                if (videoElement) {
                    videoElement.pause();
                    videoElement.src = "";
                    videoElement.load();
                }
                playerContainer.parentNode.removeChild(playerContainer);
            }
            playerContainer = null;
            videoElement = null;
            isLooping = false;
        }
    };
})();
