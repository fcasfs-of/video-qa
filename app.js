(function() {
    // ----------------------------------------------------------------------
    // 1. MOTOR DEDUTIVO DE ANÁLISE DE QUALIDADE TÉCNICA (CRIADO DO ZERO)
    // ----------------------------------------------------------------------
    const QualityEngine = {
        /**
         * Executa o cruzamento de variáveis e calcula o score técnico do vídeo (0 a 100)
         */
        analyzeVideo: function(width, height, fileSize, duration) {
            if (!width || !height) {
                return { title: 'Desconhecido', score: 0, color: '#ef4444', desc: 'Sinal de vídeo corrompido ou trilha visual ausente.' };
            }

            const totalPixels = width * height;
            let score = 40; // Pontuação base inicial

            // Heurística de Resolução Física (Peso: 50%)
            if (totalPixels >= 3840 * 2160) score = 85;      // 4K Ultra HD
            else if (totalPixels >= 1920 * 1080) score = 75; // Full HD 1080p
            else if (totalPixels >= 1280 * 720) score = 60;  // HD 720p
            else if (totalPixels >= 854 * 480) score = 45;   // SD 480p

            // Heurística de Taxa de Bits / Compressão Dinâmica (Peso: 50%)
            if (fileSize > 0 && duration > 0) {
                const bitrateMbps = ((fileSize * 8) / duration) / 1000000;
                
                // Bonificação por densidade de dados limpos (Bitrate Saudável)
                if (totalPixels >= 1920 * 1080 && bitrateMbps >= 12) score += 15;
                else if (totalPixels >= 1280 * 720 && bitrateMbps >= 5) score += 10;
                else if (bitrateMbps >= 2) score += 5;
                else score -= 10; // Penalidade por macroblocos de compressão severa
            }

            score = Math.min(Math.max(score, 0), 100);

            let title = 'Baixa Resolução / Altamente Comprimido';
            let color = '#ef4444';
            let desc = 'Imagem com compressão agressiva e perda crítica de texturas finas. Recomendado apenas para economia rigorosa de dados móveis.';

            if (score >= 85) {
                title = 'Alta Resolução / Excelente'; color = '#16a34a';
                desc = 'Fidelidade visual extrema. Presença de texturas cristalinas e nitidez cromática impecável, ideal para displays modernos.';
            } else if (score >= 60) {
                title = 'Resolução Padrão / Boa'; color = '#ca8a04';
                desc = 'Qualidade equilibrada e estável para distribuição web. Boa visibilidade, com raros artefatos perceptíveis apenas em movimentações rápidas.';
            }

            return { title: title, score: score, color: color, desc: desc, info: width + 'x' + height };
        },

        /**
         * Executa o cálculo de fidelidade acústica baseada em canais
         */
        analyzeAudio: function(audioTrack) {
            let score = 70; 
            let title = 'Estéreo Padrão / Bom';
            let color = '#ca8a04';
            let desc = 'Som estéreo limpo com separação satisfatória dos canais esquerdo e direito. Excelente clareza vocal para o consumo de streaming diário.';
            let info = '2 Ch (Stereo)';

            if (audioTrack && audioTrack.channels) {
                if (audioTrack.channels > 2) {
                    score = 90; title = 'Alta Fidelidade / Excelente'; color = '#16a34a';
                    desc = 'Áudio imersivo multicanal surround de nível teatral. Resposta de frequência expandida com reprodução cristalina.';
                    info = audioTrack.channels + ' Ch (Surround)';
                } else if (audioTrack.channels === 1) {
                    score = 45; title = 'Monofônico / Baixa Qualidade'; color = '#ef4444';
                    desc = 'Áudio misturado em canal único. Ausência de profundidade espacial e abafamento perceptível nas frequências mais altas.';
                    info = '1 Ch (Mono)';
                }
            }

            return { title: title, score: score, color: color, desc: desc, info: info };
        }
    };

    // ----------------------------------------------------------------------
    // 2. DICIONÁRIOS IDIOMÁTICOS INTERNACIONAIS (PT / EN)
    // ----------------------------------------------------------------------
    const Dictionary = {
        'pt': {
            'app-title': 'Analisador de Qualidade MP4',
            'drop-text': 'Arraste seu vídeo .mp4 aqui ou clique para selecionar',
            'title-preview': 'Miniatura Extraída',
            'title-metadata': 'Diagnóstico de Qualidade Técnica',
            'btn-save-thumb': 'Salvar Miniatura',
            'btn-save-meta': 'Salvar Diagnóstico',
            'alert-error': 'Erro ao processar o arquivo de vídeo. Certifique-se de carregar um arquivo .mp4 válido.',
            'v-quality': 'Qualidade do Vídeo',
            'a-quality': 'Qualidade do Áudio',
            'quality-desc': 'Parecer do Diagnóstico:',
            'quality-metrics': 'Estrutura de Hardware:'
        },
        'en': {
            'app-title': 'MP4 Quality Analyzer',
            'drop-text': 'Drag your .mp4 video here or click to select',
            'title-preview': 'Extracted Thumbnail',
            'title-metadata': 'Technical Quality Diagnostics',
            'btn-save-thumb': 'Save Thumbnail',
            'btn-save-meta': 'Save Diagnostics',
            'alert-error': 'Error processing file. Please ensure it is a valid .mp4 file.',
            'v-quality': 'Video Quality',
            'a-quality': 'Audio Quality',
            'quality-desc': 'AI Diagnostics:',
            'quality-metrics': 'Analyzed Metrics:'
        }
    };

    let currentLanguage = 'pt';
    let currentTheme = 'dark';
    let activePayload = null;
    let activeThumb = null;

    function init() {
        currentTheme = localStorage.getItem('meta-theme') || 'dark';
        currentLanguage = localStorage.getItem('meta-lang') || 'pt';
        applyTheme();
        applyLanguage();
        bindEvents();
    }

    function applyTheme() {
        document.documentElement.setAttribute('data-theme', currentTheme);
    }

    function applyLanguage() {
        const pack = Dictionary[currentLanguage];
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
            const key = el.getAttribute('data-i18n');
            if (pack[key]) el.textContent = pack[key];
        });
    }

    function bindEvents() {
        document.getElementById('btn-toggle-theme').addEventListener('click', function() {
            currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
            applyTheme();
            localStorage.setItem('meta-theme', currentTheme);
        });

        document.getElementById('btn-toggle-lang').addEventListener('click', function() {
            currentLanguage = currentLanguage === 'pt' ? 'en' : 'pt';
            applyLanguage();
            localStorage.setItem('meta-lang', currentLanguage);
            if (activePayload) renderUI(activePayload);
        });

        const drop = document.getElementById('drop-zone');
        const input = document.getElementById('file-input');

        drop.addEventListener('click', function() { input.click(); });
        drop.addEventListener('dragover', function(e) { e.preventDefault(); drop.classList.add('drag-over'); });
        drop.addEventListener('dragleave', function() { drop.classList.remove('drag-over'); });
        drop.addEventListener('drop', function(e) {
            e.preventDefault();
            drop.classList.remove('drag-over');
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFilesList(e.dataTransfer.files);
        });

        input.addEventListener('change', function() {
            if (input.files && input.files.length > 0) handleFilesList(input.files);
        });

        document.getElementById('btn-open-lightbox').addEventListener('click', function() {
            if (activeThumb && window.LightboxManager) window.LightboxManager.open(activeThumb, 'frame');
        });

        document.getElementById('extracted-thumb').addEventListener('click', function() {
            if (activeThumb && window.LightboxManager) window.LightboxManager.open(activeThumb, 'frame');
        });

        document.getElementById('btn-download-thumb').addEventListener('click', function() {
            if (activeThumb && window.DownloadManager) window.DownloadManager.saveThumbnailImage(activeThumb, 'mp4_thumb');
        });

        document.getElementById('btn-download-info').addEventListener('click', function() {
            if (activePayload && window.DownloadManager) window.DownloadManager.saveMetadataText(activePayload, 'quality_diagnostic');
        });
    }

    // ----------------------------------------------------------------------
    // 3. PIPELINE DE PROCESSAMENTO EXCLUSIVO LOCAL E EXTRAÇÃO ASSÍNCRONA
    // ----------------------------------------------------------------------
    function handleFilesList(filesList) {
        // CORREÇÃO CRÍTICA: Extrai cirurgicamente o primeiro arquivo indexado (posição [0]) da lista do input
        const file = filesList[0];
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        const initialMeta = { sizeBytes: file.size, name: file.name };
        extractMediaProperties(objectUrl, initialMeta);
    }

    function extractMediaProperties(mediaUrl, metaDataStructure) {
        document.getElementById('results-container').classList.remove('d-none');
        
        const videoElementContainer = document.createElement('video');
        videoElementContainer.src = mediaUrl;
        videoElementContainer.preload = 'metadata';
        videoElementContainer.muted = true;
        videoElementContainer.playsInline = true;

        videoElementContainer.addEventListener('loadedmetadata', function() {
            metaDataStructure.width = videoElementContainer.videoWidth;
            metaDataStructure.height = videoElementContainer.videoHeight;
            metaDataStructure.duration = videoElementContainer.duration;
            
            // CORREÇÃO CRÍTICA PROTEGIDA ANTI-TRAVAMENTO (CHROMIUM SAFE)
            let detectedChannels = 2; // Fallback estéreo seguro por padrão
            try {
                // Tenta mapear os canais. Se o navegador travar, o catch absorve o erro e mantém o script de pé
                if (videoElementContainer.audioTracks && videoElementContainer.audioTracks.length > 0) {
                    detectedChannels = videoElementContainer.audioTracks.length;
                }
            } catch(audioError) {
                detectedChannels = 2; 
            }
            
            metaDataStructure.audioTrackInfo = { channels: detectedChannels };
            
            // Pula 5% estáveis para evitar capturas de quadros totalmente pretos
            videoElementContainer.currentTime = Math.min(1.0, videoElementContainer.duration * 0.05);
        });

        videoElementContainer.addEventListener('seeked', function() {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = metaDataStructure.width || 640;
                canvas.height = metaDataStructure.height || 360;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(videoElementContainer, 0, 0, canvas.width, canvas.height);
                
                activeThumb = canvas.toDataURL('image/png');
                document.getElementById('extracted-thumb').src = activeThumb;

                activePayload = metaDataStructure;
                renderUI(metaDataStructure);

                if (window.VideoPlayerManager) {
                    window.VideoPlayerManager.create(mediaUrl);
                }
            } catch(e) {
                console.error("Erro gráfico ao gerar a miniatura:", e);
            }
        });

        videoElementContainer.addEventListener('error', function() {
            alert(Dictionary[currentLanguage]['alert-error']);
        });
    }

    // ----------------------------------------------------------------------
    // 4. INJEÇÃO DA INTERFACE DE DIAGNÓSTICO
    // ----------------------------------------------------------------------
    function renderUI(metadata) {
        const div = document.getElementById('metadata-display');
        const pack = Dictionary[currentLanguage];
        let h = '';

        const videoReport = QualityEngine.analyzeVideo(metadata.width, metadata.height, metadata.sizeBytes, metadata.duration);
        const audioReport = QualityEngine.analyzeAudio(metadata.audioTrackInfo);

        h += '<div class="metadata-group group-video" style="border-left-color: ' + videoReport.color + ';">';
        h += '  <div class="track-header"><h4>' + pack['v-quality'] + '</h4><span class="track-badge" style="background-color: ' + videoReport.color + ';">Video</span></div>';
        h += '  <div class="metadata-item"><span class="metadata-label">' + pack['title-metadata'] + '</span><span class="metadata-value" style="color: ' + videoReport.color + '; font-weight:700;">' + videoReport.title + ' (' + videoReport.score + '/100)</span></div>';
        h += '  <div class="metadata-item"><span class="metadata-label">' + pack['quality-metrics'] + '</span><span class="metadata-value">' + videoReport.info + '</span></div>';
        h += '  <div class="metadata-item" style="flex-direction:column; align-items:flex-start; gap:0.25rem;"><span class="metadata-label">' + pack['quality-desc'] + '</span><span class="metadata-value" style="font-size:0.85rem; font-weight:normal; color:var(--text-muted);">' + videoReport.desc + '</span></div>';
        h += '</div>';

        h += '<div class="metadata-group group-audio" style="border-left-color: ' + audioReport.color + ';">';
        h += '  <div class="track-header"><h4>' + pack['a-quality'] + '</h4><span class="track-badge" style="background-color: ' + audioReport.color + ';">Audio</span></div>';
        h += '  <div class="metadata-item"><span class="metadata-label">' + pack['title-metadata'] + '</span><span class="metadata-value" style="color: ' + audioReport.color + '; font-weight:700;">' + audioReport.title + ' (' + audioReport.score + '/100)</span></div>';
        h += '  <div class="metadata-item"><span class="metadata-label">' + pack['quality-metrics'] + '</span><span class="metadata-value">' + audioReport.info + '</span></div>';
        h += '  <div class="metadata-item" style="flex-direction:column; align-items:flex-start; gap:0.25rem;"><span class="metadata-label">' + pack['quality-desc'] + '</span><span class="metadata-value" style="font-size:0.85rem; font-weight:normal; color:var(--text-muted);">' + audioReport.desc + '</span></div>';
        h += '</div>';

        div.innerHTML = h;
    }

    init();
})();
