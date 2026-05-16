(function() {
    let lightboxContainer = null;
    let currentScale = 1;
    let wasPlayerPlaying = false; // Armazena o estado de reprodução antes da pausa

    window.LightboxManager = {
        /**
         * Cria e injeta o Lightbox no DOM com detecção inteligente de tipo de conteúdo
         * @param {string|HTMLElement} contentPayload - Base64 da imagem ou o Elemento do Player
         * @param {string} typeToken - 'image' para frames/miniaturas ou 'player' para expansão do player
         */
        open: function(contentPayload, typeToken) {
            this.closeImmediate();

            const isImage = typeToken === 'image';

            // AUTOMAÇÃO DE ENTRADA: Se for expansão de imagem, pausa o player se ele estiver rodando
            const videoEl = document.getElementById('custom-video-element');
            if (videoEl && isImage) {
                wasPlayerPlaying = !videoEl.paused && !videoEl.ended;
                if (wasPlayerPlaying) {
                    videoEl.pause();
                }
            }

            lightboxContainer = document.createElement('div');
            lightboxContainer.id = 'custom-lightbox';
            lightboxContainer.className = 'lightbox-overlay';

            // Montagem da estrutura de forma dinâmica por array join para performance pura
            let htmlBuffer = [];
            htmlBuffer.push('<div class="lightbox-toolbar">');
            
            // REGRA CONDICIONAL: Os botões de Zoom e Download só entram na árvore se for IMAGEM
            if (isImage) {
                htmlBuffer.push(
                    '<button id="btn-lightbox-zoom" aria-label="Zoom" class="lightbox-btn" title="Zoom In/Out">',
                        '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM10 7H9v2H7v1h2v2h1v-2h2V9h-2V7z"/></svg>',
                    '</button>',
                    '<button id="btn-lightbox-download" aria-label="Download" class="lightbox-btn" title="Download">',
                        '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
                    '</button>'
                );
            }

            // O botão de fechar sempre estará presente em ambos os modos
            htmlBuffer.push(
                '<button id="btn-lightbox-close" aria-label="Fechar" class="lightbox-btn close-btn" title="Fechar">',
                    '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
                '</button>',
            '</div>',
            '<div class="lightbox-content" id="lightbox-render-target">',
            '</div>'
            );

            lightboxContainer.innerHTML = htmlBuffer.join('');
            document.body.appendChild(lightboxContainer);

            // Injeção limpa do conteúdo na viewport do Lightbox
            const targetArea = lightboxContainer.querySelector('#lightbox-render-target');
            if (isImage) {
                const imgElement = document.createElement('img');
                imgElement.id = 'lightbox-target-image';
                imgElement.src = contentPayload;
                imgElement.alt = 'Preview';
                imgElement.style.cssText = 'transform: scale(1); transition: transform 0.22s cubic-bezier(0.2, 0, 0.2, 1); cursor: zoom-in;';
                targetArea.appendChild(imgElement);
                
                // Configura as escutas exclusivas do fluxo gráfico de imagem
                this.setupImageEvents(contentPayload);
            } else {
                // Modo expansão de Player: Transfere o elemento HTML real do player de vídeo para dentro do Lightbox
                if (contentPayload && contentPayload instanceof HTMLElement) {
                    targetArea.appendChild(contentPayload);
                }
            }

            // Ativa animação CSS de fade-in
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    if (lightboxContainer) {
                        lightboxContainer.classList.add('lightbox-active');
                    }
                });
            });

            // Configura os gatilhos universais de fechamento
            this.setupGlobalEvents(isImage);
        },

        setupImageEvents: function(imageSrc) {
            if (!lightboxContainer) return;

            const viewImage = lightboxContainer.querySelector('#lightbox-target-image');
            const btnZoom = lightboxContainer.querySelector('#btn-lightbox-zoom');
            const btnDownload = lightboxContainer.querySelector('#btn-lightbox-download');

            const svgZoomIn = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM10 7H9v2H7v1h2v2h1v-2h2V9h-2V7z"/></svg>';
            const svgZoomOut = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h6v2H7V9z"/></svg>';

            // Lógica do Zoom reativo na Imagem
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

            // Lógica do Download de arquivo binário de imagem
            btnDownload.addEventListener('click', function(e) {
                e.stopPropagation();
                if (window.DownloadManager) {
                    window.DownloadManager.saveThumbnailImage(imageSrc, 'mp4_snapshot_zoom');
                }
            });
        },

        setupGlobalEvents: function(isImage) {
            if (!lightboxContainer) return;

            const btnClose = lightboxContainer.querySelector('#btn-lightbox-close');

            btnClose.addEventListener('click', function(e) { 
                e.stopPropagation(); 
                window.LightboxManager.close(isImage); 
            });

            lightboxContainer.addEventListener('click', function(e) {
                if (e.target === lightboxContainer || e.target.classList.contains('lightbox-content')) {
                    window.LightboxManager.close(isImage);
                }
            });
        },

        /**
         * Remove o Lightbox do DOM com gatilho de reversão inteligente de estado
         * @param {boolean} isImageContext - Repassa o contexto de fechamento para tratamento do vídeo
         */
        close: function(isImageContext) {
            if (!lightboxContainer) return;

            lightboxContainer.classList.remove('lightbox-active');
            
            let deletionExecuted = false;
            const purgeNode = function() {
                if (deletionExecuted) return;
                deletionExecuted = true;
                
                // Se o player estiver hospedado aqui dentro antes da remoção, devolve-o ao container do rodapé original
                if (!isImageContext) {
                    const activePlayer = document.getElementById('custom-player-container');
                    const bottomAnchor = document.getElementById('footer-player-anchor') || document.body;
                    if (activePlayer) {
                        bottomAnchor.appendChild(activePlayer);
                    }
                }

                if (lightboxContainer && lightboxContainer.parentNode) {
                    lightboxContainer.parentNode.removeChild(lightboxContainer);
                }
                lightboxContainer = null;
                currentScale = 1;

                // AUTOMAÇÃO DE SAÍDA: Se uma imagem foi fechada e o vídeo rodava antes, retoma o play automaticamente
                if (isImageContext) {
                    const videoEl = document.getElementById('custom-video-element');
                    if (videoEl && wasPlayerPlaying) {
                        videoEl.play().catch(function(err) {
                            console.log("Autoplay bloqueado pós-lightbox:", err);
                        });
                    }
                }
                wasPlayerPlaying = false; // Reseta a flag de histórico
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
