# i4ware SDK - Tiedostopolut ja Riippuvuudet Yhteenveto

**Päivitetty:** 2025-10-15
**Tarkoitus:** Kattava yhteenveto kaikista tiedostopoluista ja riippuvuuksista

---

## 📁 Kriittiset Tiedostopolut

### **1. Python & CAD (STL-generointi)**

#### **Windows:**
```env
PYTHON_PATH=C:\Users\YourUsername\miniconda3\envs\cad\python.exe
```

#### **Linux:**
```env
PYTHON_PATH=/home/ubuntu/miniconda3/envs/cad/bin/python
```

#### **macOS (Apple Silicon M1/M2):**
```env
PYTHON_PATH=/opt/homebrew/Caskroom/miniconda/base/envs/cad/bin/python
```

#### **macOS (Intel):**
```env
PYTHON_PATH=/usr/local/Caskroom/miniconda/base/envs/cad/bin/python
# tai
PYTHON_PATH=$HOME/miniconda3/envs/cad/bin/python
```

---

### **2. FFmpeg (Video Processing)**

#### **Windows:**
```env
FFMPEG_BINARY=C:\ffmpeg\bin\ffmpeg.exe
FFPROBE_BINARY=C:\ffmpeg\bin\ffprobe.exe
```

#### **Linux:**
```env
FFMPEG_BINARY=/usr/bin/ffmpeg
FFPROBE_BINARY=/usr/bin/ffprobe
```

#### **macOS (Homebrew M1/M2):**
```env
FFMPEG_BINARY=/opt/homebrew/bin/ffmpeg
FFPROBE_BINARY=/opt/homebrew/bin/ffprobe
```

#### **macOS (Homebrew Intel):**
```env
FFMPEG_BINARY=/usr/local/bin/ffmpeg
FFPROBE_BINARY=/usr/local/bin/ffprobe
```

---

### **3. PHP Polut**

#### **Windows (XAMPP):**
```
C:\xampp\php\php.exe
```

#### **Linux:**
```
/usr/bin/php
# tai
/usr/bin/php8.1
```

#### **macOS (Homebrew):**
```
/opt/homebrew/bin/php    # M1/M2
/usr/local/bin/php       # Intel
```

---

### **4. Node.js & NPM Polut**

#### **Windows:**
```
C:\Program Files\nodejs\node.exe
C:\Program Files\nodejs\npm.cmd
```

#### **Linux:**
```
/usr/bin/node
/usr/bin/npm
```

#### **macOS (Homebrew):**
```
/opt/homebrew/bin/node    # M1/M2
/usr/local/bin/node       # Intel
```

---

### **5. MySQL/MariaDB Polut**

#### **Windows (XAMPP):**
```
C:\xampp\mysql\bin\mysql.exe
```

#### **Linux:**
```
/usr/bin/mysql
```

#### **macOS (Homebrew):**
```
/opt/homebrew/bin/mysql    # M1/M2
/usr/local/bin/mysql       # Intel
```

---

## 🔍 Polkujen Tarkistus

### **Windows:**

```cmd
# Python (cad-ympäristö)
conda activate cad
where python

# FFmpeg
where ffmpeg
where ffprobe

# PHP
where php

# Node.js
where node
where npm

# MySQL
where mysql
```

### **Linux/macOS:**

```bash
# Python (cad-ympäristö)
conda activate cad
which python

# FFmpeg
which ffmpeg
which ffprobe

# PHP
which php

# Node.js
which node
which npm

# MySQL
which mysql
```

---

## 📝 .env Tiedostomalli (saas-app/.env)

### **Windows:**

```env
# App
APP_NAME=i4ware
APP_ENV=local
APP_KEY=                # php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=i4ware_db
DB_USERNAME=root
DB_PASSWORD=

# Python & CAD
PYTHON_PATH=C:\Users\YourUsername\miniconda3\envs\cad\python.exe

# FFmpeg
FFMPEG_BINARY=C:\ffmpeg\bin\ffmpeg.exe
FFPROBE_BINARY=C:\ffmpeg\bin\ffprobe.exe

# OpenAI
OPENAI_API_KEY=sk-...   # https://platform.openai.com/

# Pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

# Laravel Passport
PASSPORT_PERSONAL_ACCESS_CLIENT_ID=
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET=
```

### **Linux:**

```env
# App
APP_NAME=i4ware
APP_ENV=local
APP_KEY=                # php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=i4ware_db
DB_USERNAME=root
DB_PASSWORD=

# Python & CAD
PYTHON_PATH=/home/ubuntu/miniconda3/envs/cad/bin/python

# FFmpeg
FFMPEG_BINARY=/usr/bin/ffmpeg
FFPROBE_BINARY=/usr/bin/ffprobe

# OpenAI
OPENAI_API_KEY=sk-...   # https://platform.openai.com/

# Pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

# Laravel Passport
PASSPORT_PERSONAL_ACCESS_CLIENT_ID=
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET=
```

### **macOS (M1/M2 Apple Silicon):**

```env
# App
APP_NAME=i4ware
APP_ENV=local
APP_KEY=                # php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=i4ware_db
DB_USERNAME=root
DB_PASSWORD=

# Python & CAD
PYTHON_PATH=/opt/homebrew/Caskroom/miniconda/base/envs/cad/bin/python

# FFmpeg
FFMPEG_BINARY=/opt/homebrew/bin/ffmpeg
FFPROBE_BINARY=/opt/homebrew/bin/ffprobe

# OpenAI
OPENAI_API_KEY=sk-...   # https://platform.openai.com/

# Pusher
PUSHER_APP_ID=
PUSHER_APP_KEY=
PUSHER_APP_SECRET=
PUSHER_APP_CLUSTER=mt1

# Laravel Passport
PASSPORT_PERSONAL_ACCESS_CLIENT_ID=
PASSPORT_PERSONAL_ACCESS_CLIENT_SECRET=
```

### **macOS (Intel):**

```env
# Python & CAD
PYTHON_PATH=/usr/local/Caskroom/miniconda/base/envs/cad/bin/python
# tai
PYTHON_PATH=$HOME/miniconda3/envs/cad/bin/python

# FFmpeg
FFMPEG_BINARY=/usr/local/bin/ffmpeg
FFPROBE_BINARY=/usr/local/bin/ffprobe
```

---

## 🔧 Koodipolut Tiedostoissa

### **StlController.php** (`saas-app/app/Http/Controllers/StlController.php`)

**Rivit 227, 311, 395:**
```php
$pythonPath = env('PYTHON_PATH', '/home/ubuntu/miniconda3/envs/cad/bin/python');
```

**Windows-tuki (rivit 233-234, 317-318, 401-402):**
```php
if ($isWindows) {
    $command = [$pythonPath, base_path('scripts/spaceship.py'), $filename];
    $envVars = [];
}
```

**Linux/macOS-tuki (rivit 237-238, 321-322, 405-406):**
```php
else {
    $command = ['/usr/bin/xvfb-run', '-a', $pythonPath, base_path('scripts/spaceship.py'), $filename];
    $envVars = [
        'LIBGL_ALWAYS_SOFTWARE' => '1',
        'QT_QPA_PLATFORM'       => 'offscreen',
        'MESA_GLSL_CACHE_DIR'   => $mesaCache,
        'QT_LOGGING_RULES'      => '*.debug=false;qt.qpa.*=false',
        'GALLIUM_DRIVER'        => 'llvmpipe',
    ];
}
```

---

### **Python-skriptit** (`saas-app/scripts/`)

**Tiedostot:**
- `spaceship.py` - Avaruusaluksen generointi
- `cyborg.py` - Cyborgin generointi
- `sportcar.py` - Urheiluauton generointi
- `test_opencascade.py` - OpenCascade-asennuksen testaus

**Kaikki skriptit käyttävät:**
```python
from OCC.Core.BRepPrimAPI import ...
from OCC.Core.BRepAlgoAPI import ...
from OCC.Core.gp import ...
from OCC.Extend.DataExchange import write_stl_file
from OCC.Display.OCCViewer import OffscreenRenderer
```

**Headless-tuki:**
- ✅ Ei `init_display()` kutsuja
- ✅ Käyttää vain `OffscreenRenderer`ia
- ✅ Toimii Windowsilla, Linuxilla ja macOS:llä

---

## 📦 Riippuvuusyhteenveto

### **Python CAD-ympäristö:**
```bash
conda create -n cad python=3.9 -y
conda activate cad
conda install -c conda-forge pythonocc-core -y
```

**Asennetut kirjastot:**
- `pythonocc-core` 7.7.x
- `vtk` 9.x
- `numpy` 1.x
- `pillow` 9.x-10.x
- `freetype`, `freeimage`, `tbb`
- `opengl`, `mesa`

---

### **Backend (Laravel 9):**
```bash
cd saas-app
composer install
npm install
```

**PHP-versio:** 7.3 - 8.2 (suositeltu 8.1+)

**Tärkeimmät Composer-paketit:**
- `laravel/framework` ^9.0
- `laravel/passport` ^10.3
- `laravel/sanctum` ^2.14
- `openai-php/client` ^0.15.0
- `pusher/pusher-php-server` ^7.2
- `pbmedia/laravel-ffmpeg` ^8.3
- `maatwebsite/excel` ^3.1
- `phpoffice/phpword` ^1.3
- `smalot/pdfparser` ^2.12

---

### **Frontend (React 18):**
```bash
cd login-form
npm install
```

**Node.js-versio:** 16.x, 18.x, tai 20.x (suositeltu 18.x)

**Tärkeimmät NPM-paketit:**
- `react` ^18.3.1
- `react-dom` ^18.3.1
- `react-router-dom` ^5.3.0
- `bootstrap` ^5.1.3
- `axios` ^1.1.3
- `three` ^0.156.1 (STL-viewer)
- `pusher-js` ^8.4.0-rc2
- `chart.js` ^4.3.0
- `formik` ^2.2.9

**Yhteensä:** ~60 NPM-pakettia

---

## 🎯 Tiedostorakenne

```
i4ware_SDK/
├── login-form/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json             # Frontend riippuvuudet
│   └── .env                     # Frontend config (ei tarvita)
│
├── saas-app/                    # Laravel backend
│   ├── app/
│   │   └── Http/
│   │       └── Controllers/
│   │           └── StlController.php    # STL-generointi controller
│   ├── scripts/
│   │   ├── spaceship.py         # Avaruusalus
│   │   ├── cyborg.py            # Cyborg
│   │   ├── sportcar.py          # Urheilul
│   │   └── test_opencascade.py  # Testi
│   ├── storage/
│   │   └── app/
│   │       └── public/
│   │           ├── stl-files/          # Generoidut STL-tiedostot
│   │           └── stl-screenshots/    # Screenshot-kuvat
│   ├── .env                     # ⚠️ TÄRKEIN KONFIGURAATIOTIEDOSTO
│   ├── .env.example             # .env-malli
│   ├── composer.json            # Backend riippuvuudet
│   └── package.json             # Laravel Mix assets
│
├── WinConda.md                  # Windows-asennusohje
├── Branchit-Seloste.md          # Branch-dokumentaatio (gitignored)
├── VismaNetvisor.md             # Visma-dokumentaatio (gitignored)
└── TIEDOSTOPOLUT_YHTEENVETO.md  # Tämä tiedosto
```

---

## ✅ Tarkistuslista Asennukselle

### **1. Python CAD-ympäristö:**
- [ ] Miniconda asennettu
- [ ] `cad`-ympäristö luotu (`conda create -n cad python=3.9`)
- [ ] `pythonocc-core` asennettu (`conda install -c conda-forge pythonocc-core`)
- [ ] Testi läpäisty (`python test_opencascade.py`)
- [ ] Python-polku lisätty `.env`:hen (`PYTHON_PATH=...`)

### **2. Backend (Laravel):**
- [ ] PHP 8.1+ asennettu
- [ ] Composer asennettu
- [ ] MySQL/MariaDB asennettu ja käynnissä
- [ ] `composer install` ajettu
- [ ] `npm install` ajettu (saas-app/)
- [ ] `.env` tiedosto luotu ja konfiguroitu
- [ ] `php artisan key:generate` ajettu
- [ ] `php artisan migrate` ajettu
- [ ] `php artisan passport:install` ajettu

### **3. Frontend (React):**
- [ ] Node.js 18.x asennettu
- [ ] `npm install` ajettu (login-form/)

### **4. Lisäriippuvuudet:**
- [ ] FFmpeg asennettu
- [ ] FFmpeg-polku lisätty `.env`:hen
- [ ] Git asennettu
- [ ] OpenAI API-avain hankittu ja lisätty `.env`:hen
- [ ] Pusher-tunnukset hankittu ja lisätty `.env`:hen (jos tarvitaan)

### **5. Linux-spesifit (jos Linux):**
- [ ] `xvfb` asennettu (`sudo apt install xvfb`)
- [ ] OpenGL-kirjastot asennettu (`libgl1-mesa-glx`, jne.)

### **6. Testaus:**
- [ ] Backend käynnistyy: `php artisan serve`
- [ ] Queue worker käynnistyy: `php artisan queue:work`
- [ ] Frontend käynnistyy: `npm start`
- [ ] STL-generointi toimii (Generate Spaceship/Cyborg/Car)

---

## 🚀 Käynnistyskomennot

### **Development (3 terminaalia):**

**Terminal 1 - Backend:**
```bash
cd saas-app
php artisan serve
```

**Terminal 2 - Queue Worker:**
```bash
cd saas-app
php artisan queue:work
```

**Terminal 3 - Frontend:**
```bash
cd login-form
npm start
```

**Avaa selain:** http://localhost:3000

---

## 📞 Tuki

Jos ongelmia ilmenee, tarkista:

1. **Lokit:**
   - Laravel: `saas-app/storage/logs/laravel.log`
   - PHP: `php artisan serve` output

2. **Ympäristömuuttujat:**
   - `saas-app/.env` - Tarkista kaikki polut

3. **Python-ympäristö:**
   - `conda activate cad`
   - `python test_opencascade.py`

4. **Dokumentaatio:**
   - `WinConda.md` - Windows-ohjeet
   - `CLAUDE.md` - Projektin yleiskatsaus
   - `Branchit-Seloste.md` - Branch-historia

---

**Dokumentti luotu:** 2025-10-15
**Versio:** 1.0
**Tekijä:** i4ware SDK Team
**Status:** ✅ Kattava yhteenveto kaikille käyttöjärjestelmille
