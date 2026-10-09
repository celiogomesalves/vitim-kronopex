import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles } from 'lucide-react';

export function PwaInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if dismissed previously
    const dismissed = localStorage.getItem('kronopex_pwa_dismissed');
    if (dismissed) return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Also detect if running standalone already
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback instructions for iOS or desktop
      alert('Para instalar o App KronoPex:\n1. Toque no botão de Compartilhar do seu navegador\n2. Selecione "Adicionar à Tela de Início"');
      setIsVisible(false);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('kronopex_pwa_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-install-banner glass-panel animate-slide-down">
      <div className="container flex-between py-2 px-3">
        <div className="flex-center gap-3">
          <img src="/logo.png" alt="KronoPex App" className="pwa-icon-thumb" />
          <div className="pwa-text-box">
            <strong className="block text-xs text-main">Instale o App KronoPex</strong>
            <span className="text-xs text-muted">Peça autopeças muito mais rápido direto da sua tela inicial</span>
          </div>
        </div>

        <div className="flex-center gap-2">
          <button
            onClick={handleInstallClick}
            className="btn btn-primary btn-xs flex-center gap-1 font-bold"
          >
            <Download size={13} />
            <span>Instalar App</span>
          </button>
          <button
            onClick={handleDismiss}
            className="pwa-dismiss-btn"
            aria-label="Dispensar aviso"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
