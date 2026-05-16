(function() {
    let lightboxContainer = null;
    let currentScale = 1;
    let wasPlayerPlaying = false; // Armazena o estado de reprodução antes da pausa

    window.LightboxManager = {
        /**
         * Cria e injeta o Lightbox no DOM e gerencia a pausa automática do player
         * @param {string} imageSrc - String base64 ou URL da imagem capturada
         * @param {string} fileName - Prefixo nominal para download
         */
        open: function(imageSrc, fileName) {
            this.closeImmediate();

            const titleToken = fileName || 'mp4_snapshot';

            // AUTOMAÇÃO DE ENTRADA: Detecta se o player customizado existe e está reproduzindo
            const videoEl = document.getElementById('custom-video-element');
            if (videoEl) {
                wasPlayerPlaying = !videoEl.paused && !videoEl.ended;
                if (wasPlayerPlaying) {
                    videoEl.pause(); // Pausa o vídeo de forma automática ao abrir o Lightbox
                }
            }

            lightboxContainer = document.createElement('div');
            lightboxContainer.id = 'custom-lightbox';
            lightboxContainer.className = 'lightbox-overlay';

            lightboxContainer.innerHTML = [
                '<div class="lightbox-toolbar">',
                    '<button id="btn-lightbox-zoom" aria-label="Zoom" class="lightbox-btn" title="Zoom In/Out">',
                        '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM10 7H9v2H7v1h2v2h1v-2h2V9h-2V7z"/></svg>',
                    '</button>',
                    '<button id="btn-lightbox-download" aria-label="Download" class="lightbox-btn" title="Download">',
                        '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
                    '</button>',
                    '<button id="btn-lightbox-close" aria-label="Fechar" class="lightbox-btn close-btn" title="Fechar">',
                        '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
                    '</button>',
                '</div>',
                '<div class="lightbox-content">',
                    '<img id="lightbox-target-image" src="', imageSrc, '" alt="Preview" style="transform: scale(1); transition: transform 0.22s cubic-bezier(0.2, 0, 0.2, 1); cursor: zoom-in;">',
                '</div>'
            ].join('');

            document.body.appendChild(lightboxContainer);

            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    if (lightboxContainer) {
                        lightboxContainer.classList.add('lightbox-active');
                    }
                });
            });

            this.setupLightboxEvents(imageSrc, titleToken);
        },

        setupLightboxEvents: function(imageSrc, titleToken) {
            if (!lightboxContainer) return;

            const viewImage = lightboxContainer.querySelector('#lightbox-target-image');
            const btnZoom = lightboxContainer.querySelector('#btn-lightbox-zoom');
            const btnDownload = lightboxContainer.querySelector('#btn-lightbox-download');
            const btnClose = lightboxContainer.querySelector('#btn-lightbox-close');

            const svgZoomIn = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM10 7H9v2H7v1h2v2h1v-2h2V9h-2V7z"/></svg>';
            const svgZoomOut = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h6v2H7V9z"/></svg>';

            // Lógica do Zoom
            btnZoom.addEventListener('click', function(e) {
                e.stopPropagation();
                if (currentScale === 1) {
                    currentScale = 2;
                    viewImage.style.transform = "scale(2)";
                    viewImage.style.cursor = "zoom-out";
                    btnZoom.innerHTML = svgZoomOut;
                } else {
                    currentScale = 1;
                    viewImage.style.transform = "scale(1)";
                    viewImage.style.cursor = "zoom-in";
                    btnZoom.innerHTML = svgZoomIn;
                }
            });

            // Lógica do Download
            btnDownload.addEventListener('click', function(e) {
                e.stopPropagation();
                if (window.DownloadManager) {
                    window.DownloadManager.saveThumbnailImage(imageSrc, titleToken);
                }
            });

            // Gatilhos de Fechamento
            btnClose.addEventListener('click', function(e) { e.stopPropagation(); window.LightboxManager.close(); });
            lightboxContainer.addEventListener('click', function(e) {
                if (e.target === lightboxContainer || e.target.classList.contains('lightbox-content')) {
                    window.LightboxManager.close();
                }
            });
        },

        /**
         * Remove o Lightbox e AUTOMATICAMENTE retoma o player se ele estava tocando antes
         */
        close: function() {
            if (!lightboxContainer) return;

            lightboxContainer.classList.remove('lightbox-active');
            
            let deletionExecuted = false;
            const purgeNode = function() {
                if (deletionExecuted) return;
                deletionExecuted = true;
                
                if (lightboxContainer && lightboxContainer.parentNode) {
                    lightboxContainer.parentNode.removeChild(lightboxContainer);
                }
                lightboxContainer = null;
                currentScale = 1;

                // AUTOMAÇÃO DE SAÍDA: Retoma a reprodução apenas se o vídeo estava tocando antes do clique
                const videoEl = document.getElementById('custom-video-element');
                if (videoEl && wasPlayerPlaying) {
                    videoEl.play().catch(function(err) {
                        console.log("Erro ao retomar o autoplay pós-lightbox:", err);
                    });
                    
                    // Sincroniza visualmente o ícone do botão play do player de volta para Pause
                    const btnPlay = document.getElementById('btn-player-play');
                    if (btnPlay) {
                        btnPlay.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
                    }
                }
                wasPlayerPlaying = false; // Reseta o estado de verificação
            };

            lightboxContainer.addEventListener('transitionend', purgeNode, { once: true });
            setTimeout(purgeNode, 350); 
        },

        closeImmediate: function() {
            const residualInstance = document.getElementById('custom-lightbox');
            if (residualInstance && residualInstance.parentNode) {
                residualInstance.parentNode.removeChild(residualInstance);
            }
            lightboxContainer = null;
            currentScale = 1;
            wasPlayerPlaying = false;
        }
    };
})();
