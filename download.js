(function() {
    window.DownloadManager = {
        /**
         * Exporta o diagnóstico de qualidade lendo os dados reais impressos na tela
         * @param {Object} analysisObject - Objeto de metadados coletados pelo app.js
         * @param {string} baseName - Nome base do arquivo para exportação
         */
        saveMetadataText: function(analysisObject, baseName) {
            if (!analysisObject) return;

            const nameToken = baseName || 'quality_diagnostic';

            try {
                // Captura as strings de diagnóstico técnico diretamente da interface do usuário
                const metadataGroups = document.querySelectorAll('#metadata-display .metadata-group');
                let videoDiagnosticText = "N/A";
                let audioDiagnosticText = "N/A";

                metadataGroups.forEach(function(group) {
                    const badge = group.querySelector('.track-badge');
                    const valueEl = group.querySelector('.metadata-item .metadata-value');
                    
                    if (badge && valueEl) {
                        const type = badge.textContent.trim().toLowerCase();
                        if (type === 'video') {
                            videoDiagnosticText = valueEl.textContent.trim();
                        } else if (type === 'audio') {
                            audioDiagnosticText = valueEl.textContent.trim();
                        }
                    }
                });

                // Constrói uma nova árvore estruturada com base nas informações em exibição
                const exportPayload = {
                    "arquivo": {
                        "nome": analysisObject.name || "video_local.mp4",
                        "tamanho_bytes": analysisObject.sizeBytes || "N/A",
                        "tamanho_mb": analysisObject.sizeBytes ? (analysisObject.sizeBytes / 1024 / 1024).toFixed(2) + " MB" : "N/A",
                        "duracao_segundos": analysisObject.duration ? analysisObject.duration.toFixed(2) : "N/A"
                    },
                    "diagnostico_video": {
                        "resultado": videoDiagnosticText,
                        "resolucao_nativa": (analysisObject.width || 0) + "x" + (analysisObject.height || 0)
                    },
                    "diagnostico_audio": {
                        "resultado": audioDiagnosticText,
                        "canais_detectados": (analysisObject.audioTrackInfo && analysisObject.audioTrackInfo.channels ? analysisObject.audioTrackInfo.channels : 2) + " Ch"
                    },
                    "metadados_sistema": {
                        "data_analise": new Date().toLocaleString("pt-BR"),
                        "engine_versao": "1.1.0-Direct-UI-Capture"
                    }
                };

                // Transforma o objeto estruturado em texto identado com espaçamento 4
                const jsonString = JSON.stringify(exportPayload, null, 4);
                const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
                const blobUrl = URL.createObjectURL(blob);
                
                const anchor = document.createElement('a');
                anchor.href = blobUrl;
                anchor.download = nameToken + '.json';
                anchor.style.display = 'none';
                
                document.body.appendChild(anchor);
                anchor.click();
                
                // Executa a limpeza de memória e remoção de nós temporários
                document.body.removeChild(anchor);
                URL.revokeObjectURL(blobUrl);
            } catch (error) {
                console.error("Falha ao exportar diagnóstico JSON de qualidade:", error);
            }
        },

        /**
         * Dispara o download de arquivos de imagem (Miniaturas e snapshots)
         * @param {string} dataUrl - String base64 ou URL blob da imagem capturada
         * @param {string} baseName - Nome base do arquivo para exportação
         */
        saveThumbnailImage: function(dataUrl, baseName) {
            if (!dataUrl) return;

            const nameToken = baseName || 'video_thumbnail';

            try {
                const anchor = document.createElement('a');
                anchor.href = dataUrl;
                anchor.download = nameToken + '.png';
                anchor.style.display = 'none';
                
                document.body.appendChild(anchor);
                anchor.click();
                
                document.body.removeChild(anchor);
            } catch (error) {
                console.error("Falha ao exportar o arquivo de imagem PNG:", error);
            }
        }
    };
})();

