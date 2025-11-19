Curriculum Diseinurako Laguntzailea 🎓
Euskal curriculum diseinurako tresna adimenduna, ANECA/AUDIT/GJH arauekin bateragarria.

🚀 Ezaugarriak
Ikaskuntza Emaitzen Diseinua ANECA/AUDIT arauetara egokituak

GJH Integrazioa (Garapen Jasangarrirako Helburuak)

Groq AI bidezko iradokizun automatikoak

Interfaze erraza euskaraz

🛠️ Instalazioa
Deskargatu kodea:

bash
git clone https://github.com/zure-izena/curriculum-diseinu-laguntzailea.git
cd curriculum-diseinu-laguntzailea
API Gakoa Konfiguratu:

bash
# 1. Kopiatu template fitxategia
cp src/config/app-config-template.js src/config/app-config.js

# 2. Editatu app-config.js eta jarri zure API gakoa
nano src/config/app-config.js
API Gakoa Lortu:

Joan: https://console.groq.com

Erregistratu (doakoa da)

Sortu API gako berria

Kopiatu gakoa

Abiarazi aplikazioa:

bash
python -m http.server 8000
# edo
npx http-server
# edo
php -S localhost:8000
Bisitatu: http://localhost:8000

📋 Erabilera
Aukeratu gradua, kurtsoa eta irakasgaia

Ikusi automatikoki kargatzen diren datuak

Egin klik "Iradokizunak Sortu" botoian

Ikusi 6 ataletako curriculum proposamena

🏗️ Egitura Teknikoa
Frontend: HTML5, Tailwind CSS, JavaScript ES6+

AI API: Groq Cloud

Datuak: JSON formatuan

Hizkuntza: Euskara

⚠️ Oharra
API gakoa konfiguratu behar da src/config/app-config.js fitxategian.

📄 Lizentzia
MIT Lizentzia - LICENSE fitxategia ikusi
