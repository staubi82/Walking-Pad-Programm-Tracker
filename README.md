# 🏃‍♂️ Walking-Pad Tracker

Ein professioneller Walking-Pad Tracker für Live-Training und detaillierte Statistiken. Perfekt für alle, die ihre Fitness-Ziele verfolgen und ihre Trainingsfortschritte analysieren möchten.

![Walking-Pad Tracker](https://img.shields.io/badge/Version-1.0.0-green.svg)
![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-blue.svg)

## ✨ Features

### 🎯 **Live Tracking**
- ⏱️ **Timer & Stoppuhr**: Vordefinierte Timer (15-90 Min) oder freies Training
- 🏃‍♂️ **Geschwindigkeitskontrolle**: 1.0 - 6.0 km/h in 0.5er Schritten
- 📊 **Live-Statistiken**: Echtzeit-Anzeige von Distanz, Kalorien und Zeit
- 🎚️ **Timeline-Editor**: Erstelle komplexe Trainingsprogramme im Voraus

### 📈 **Erweiterte Analyse**
- 📊 **Highcharts Integration**: Professionelle Geschwindigkeitsdiagramme
- 🏆 **Schwierigkeitslevel**: 6 verschiedene Level von Anfänger bis Selbstmord
- 📱 **Responsive Design**: Optimiert für Desktop, Tablet und Mobile
- 🔥 **Kalorienverfolgung**: Automatische Berechnung basierend auf MET-Werten

### 💾 **Datenverwaltung**
- 🔥 **Firebase Integration**: Cloud-Speicherung mit Offline-Fallback
- 📝 **Programm-Editor**: Bearbeite gespeicherte Trainings nachträglich
- 🗂️ **Intelligente Filter**: Sortierung nach Name, Level, Distanz, Kalorien
- 📊 **Detaillierte Statistiken**: Wöchentliche und monatliche Auswertungen

## 🚀 Live Demo

[Demo ansehen](https://your-demo-url.com) *(Link zu Ihrer gehosteten Version)*

## 📋 Voraussetzungen

- **Node.js** 18.0 oder höher
- **npm** oder **yarn**
- **Git**
- **VServer** mit Ubuntu 20.04+ (für Deployment)

## 🛠️ Installation

### 📦 Lokale Entwicklung

```bash
# Repository klonen
git clone https://github.com/staubi82/walking-pad-tracker.git
cd walking-pad-tracker

# Dependencies installieren
npm install

# Entwicklungsserver starten
npm run dev
```

Die Anwendung ist dann unter `http://localhost:5173` verfügbar.

### 🌐 VServer Installation (Ubuntu)

#### 1️⃣ **Server vorbereiten**

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js 18 installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 für Prozessmanagement installieren
sudo npm install -g pm2

# Nginx installieren
sudo apt install nginx -y

# Firewall konfigurieren
sudo ufw allow 'Nginx Full'
sudo ufw allow ssh
sudo ufw --force enable
```

#### 2️⃣ **Projekt deployen**

```bash
# Benutzer für die App erstellen
sudo adduser walkingpad
sudo usermod -aG sudo walkingpad
su - walkingpad

# Repository klonen
git clone https://github.com/staubi82/walking-pad-tracker.git
cd walking-pad-tracker

# Dependencies installieren
npm install

# Production Build erstellen
npm run build
```

#### 3️⃣ **Nginx konfigurieren**

```bash
# Nginx-Konfiguration erstellen
sudo nano /etc/nginx/sites-available/walkingpad-tracker
```

**Nginx-Konfiguration:**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Proxy zu Node.js App auf Port 3814
    location / {
        proxy_pass http://localhost:3814;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Optional: Direkter Zugriff auf statische Dateien (Performance-Optimierung)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        root /home/walkingpad/walking-pad-tracker/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri @proxy;
    }
    
    location @proxy {
        proxy_pass http://localhost:3814;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Alternative: Einfache statische Dateien (ohne Node.js)
# server {
#     listen 80;
#     server_name your-domain.com www.your-domain.com;
#     
#     root /home/walkingpad/walking-pad-tracker/dist;
#     index index.html;
#     
#     # Gzip Kompression
#     gzip on;
#     gzip_vary on;
#     gzip_min_length 1024;
#     gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
#     
#     # Cache-Headers für statische Dateien
#     location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
#         expires 1y;
#         add_header Cache-Control "public, immutable";
#     }
#     
#     # SPA Routing
#     location / {
#         try_files $uri $uri/ /index.html;
#     }
# }
```

**Vereinfachte Nginx-Konfiguration (nur statische Dateien):**

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    root /home/walkingpad/walking-pad-tracker/dist;
    index index.html;
    
    # Gzip Kompression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache-Headers für statische Dateien
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA Routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

```bash
# Konfiguration aktivieren
sudo ln -s /etc/nginx/sites-available/walkingpad-tracker /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Nginx testen und neustarten
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

#### 4️⃣ **SSL mit Let's Encrypt (optional)**

```bash
# Certbot installieren
sudo apt install certbot python3-certbot-nginx -y

# SSL-Zertifikat erstellen
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-Renewal testen
sudo certbot renew --dry-run
```

#### 5️⃣ **Automatische Updates einrichten**

```bash
# Update-Script erstellen
nano /home/walkingpad/update-app.sh
```

**Update-Script:**

```bash
#!/bin/bash
cd /home/walkingpad/walking-pad-tracker

# Neueste Version pullen
git pull origin main

# Dependencies aktualisieren
npm install

# Neuen Build erstellen
npm run build

# Nginx neuladen
sudo systemctl reload nginx

echo "App erfolgreich aktualisiert!"
```

```bash
# Script ausführbar machen
chmod +x /home/walkingpad/update-app.sh

# Cronjob für automatische Updates (optional)
crontab -e
# Fügen Sie hinzu: 0 2 * * 0 /home/walkingpad/update-app.sh
```

## 🔧 Konfiguration

### 🔥 Firebase Setup (optional)

1. **Firebase Projekt erstellen** auf [Firebase Console](https://console.firebase.google.com/)

2. **Firestore Database** aktivieren

3. **Umgebungsvariablen** konfigurieren:

```bash
# .env Datei erstellen
cp .env.example .env
nano .env
```

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

4. **Firestore Regeln** konfigurieren:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

## 📱 Verwendung

### 🎯 **Training starten**

1. **Live Tracking** Tab öffnen
2. **Trainingsname** eingeben
3. **Schwierigkeitslevel** wählen (optional)
4. **Timer** aktivieren oder Stoppuhr verwenden
5. **Training starten** und Geschwindigkeit anpassen

### 📊 **Programme verwalten**

1. **Programme** Tab öffnen
2. **Sortierung** nach Name, Level, Distanz oder Kalorien
3. **Filter** für erweiterte Suche verwenden
4. **Bearbeiten** oder **Löschen** von Programmen

### 📈 **Statistiken ansehen**

1. **Statistiken** Tab öffnen
2. **Gesamtstatistiken** und **Zeiträume** analysieren
3. **Persönliche Rekorde** verfolgen

## 🔧 Entwicklung

### 📝 **Verfügbare Scripts**

```bash
npm run dev          # Entwicklungsserver
npm run build        # Production Build
npm run preview      # Build-Vorschau
npm run lint         # Code-Linting
```

### 🏗️ **Projekt-Struktur**

```
src/
├── components/          # React-Komponenten
│   ├── LiveTracker.tsx     # Live-Training
│   ├── SessionHistory.tsx  # Programm-Verwaltung
│   ├── Statistics.tsx      # Statistiken
│   └── ...
├── firebase/           # Firebase-Integration
├── types/              # TypeScript-Typen
├── utils/              # Hilfsfunktionen
└── App.tsx            # Haupt-App-Komponente
```

### 🎨 **Technologie-Stack**

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Highcharts + Recharts
- **Icons**: Lucide React
- **Backend**: Firebase Firestore
- **Build**: Vite
- **Deployment**: Nginx

## 🤝 Contributing

1. **Fork** das Repository
2. **Feature Branch** erstellen (`git checkout -b feature/AmazingFeature`)
3. **Änderungen committen** (`git commit -m 'Add some AmazingFeature'`)
4. **Branch pushen** (`git push origin feature/AmazingFeature`)
5. **Pull Request** erstellen

## 📄 Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Siehe [LICENSE](LICENSE) für Details.

## 👨‍💻 Autor

**Staubi** - [GitHub](https://github.com/staubi82)

## 🙏 Danksagungen

- [React](https://reactjs.org/) - UI Framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework
- [Highcharts](https://www.highcharts.com/) - Charting Library
- [Firebase](https://firebase.google.com/) - Backend Services
- [Lucide](https://lucide.dev/) - Icon Library

## 📞 Support

Bei Fragen oder Problemen:

1. **Issues** auf GitHub erstellen
2. **Dokumentation** durchlesen
3. **Community** um Hilfe bitten

---

⭐ **Gefällt Ihnen das Projekt?** Geben Sie uns einen Stern auf GitHub!

🏃‍♂️ **Happy Walking!** Bleiben Sie aktiv und gesund!