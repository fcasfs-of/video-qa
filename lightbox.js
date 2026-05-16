    (function() {
    // Mantém as referências internas isoladas em escopo de módulo efêmero
    let lightboxContainer = null;
    let currentScale = 1;

    window.LightboxManager = {
        /**
         * Cria, configura e injeta dinamicamente o Lightbox na página
         * @param {string} imageSrc - String base64 ou URL de origem da miniatura capturada
         * @param {string} fileName - Prefixo nominal de identificação para o arquivo de salvamento
         */
        open: function(imageSrc, fileName) {
            // Varre e limpa preventivamente qualquer resquício órfão de chamadas anteriores
            this.closeImmediate();

            const titleToken = fileName || 'mp4_snapshot';

            // Constrói o elemento contêiner mestre que ocupará toda a viewport
            lightboxContainer = document.createElement('div');
            lightboxContainer.id = 'custom-lightbox';
            lightboxContainer.className = 'lightbox-overlay';

            // Injeta a estrutura semântica junto com todas as descrições de caminhos vetoriais SVG
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

            // Dois ciclos paralelos de renderização para garantir o engajamento perfeito da animação opaca via CSS
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    if (lightboxContainer) {
                        lightboxContainer.classList.add('lightbox-active');
                    }
                });
            });

            this.setupLightboxEvents(imageSrc, titleToken);
        },

        /**
         * Mapeia os barramentos de escuta reativos para interações do usuário dentro da interface flutuante
         */
        setupLightboxEvents: function(imageSrc, titleToken) {
            if (!lightboxContainer) return;

            const viewImage = lightboxContainer.querySelector('#lightbox-target-image');
            const btnZoom = lightboxContainer.querySelector('#btn-lightbox-zoom');
            const btnDownload = lightboxContainer.querySelector('#btn-lightbox-download');
            const btnClose = lightboxContainer.querySelector('#btn-lightbox-close');

            const svgZoomIn = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM10 7H9v2H7v1h2v2h1v-2h2V9h-2V7z"/></svg>';
            const svgZoomOut = '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM7 9h6v2H7V9z"/></svg>';

            // Lógica alternadora de nível dimensional de escala (Zoom 1x <-> 2x)
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

            // Dispara a rotina de salvamento delegada de forma explícita ao DownloadManager global
            btnDownload.addEventListener('click', function(e) {
                e.stopPropagation();
                if (window.DownloadManager) {
                    window.DownloadManager.saveThumbnailImage(imageSrc, titleToken);
                }
            });

            // Conecta gatilhos de fechamento (Botão X e cliques na área escura vazia)
            btnClose.addEventListener('click', function(e) { e.stopPropagation(); window.LightboxManager.close(); });
            lightboxContainer.addEventListener('click', function(e) {
                if (e.target === lightboxContainer || e.target.classList.contains('lightbox-content')) {
                    window.LightboxManager.close();
                }
            });
        },

        /**
         * Dispara a animação visual de fade-out e desvincula completamente o elemento da página
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
            };

            // Remove o nó da árvore HTML assim que o efeito visual do CSS termina
            lightboxContainer.addEventListener('transitionend', purgeNode, { once: true });
            
            // Fallback de tempo determinístico caso o navegador falhe na detecção do evento
            setTimeout(purgeNode, 350);
        },

        /**
         * Executa a varredura síncrona forçada para limpar qualquer instância órfã
         */
        closeImmediate: function() {
            const residualInstance = document.getElementById('custom-lightbox');
            if (residualInstance && residualInstance.parentNode) {
                residualInstance.parentNode.removeChild(residualInstance);
            }
            lightboxContainer = null;
            currentScale = 1;
        }
    };
})();
