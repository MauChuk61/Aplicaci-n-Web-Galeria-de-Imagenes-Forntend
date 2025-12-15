import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  showSessionExpired(): void {
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem 3rem;
        border-radius: 1rem;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
      ">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⏰</div>
        <h2 style="
          color: #DC2626;
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        ">Sesión Expirada</h2>
        <p style="
          color: #6B7280;
          font-size: 1rem;
        ">Su sesión ha expirado. Será redirigido al login.</p>
      </div>
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        backdrop-filter: blur(4px);
        z-index: 9999;
      "></div>
      <style>
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -60%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      </style>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transition = 'opacity 0.3s ease-out';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 2500);
  }
}
