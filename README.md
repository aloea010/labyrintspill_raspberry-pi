# Labyrintspill med Raspberry Pi, Flask og MariaDB

Dette er et nettleserbasert labyrintspill utviklet i HTML, CSS og JavaScript, koblet til en Python (Flask) backend og en MariaDB-database på en Raspberry Pi. Målet med prosjektet er å la flere brukere på samme nettverk spille og konkurrere på en felles topp 5-liste.

## Teknologier brukt
* **Frontend:** HTML5, CSS3, JavaScript (labyrintgenerator, hemmelige passasjer, tidtaker og API-kall)
* **Backend:** Python 3 og Flask
* **Database:** MariaDB (`pymysql`)
* **Drift & Nettverk:** Raspberry Pi OS med statisk IP (`10.200.1.11`) og SSH-tilgang

---

## Brukerveiledning for spillere
1. Åpne nettleseren på en enhet koblet til samme nettverk som serveren og gå til `http://10.200.1.11:5000`.
2. Skriv inn navnet ditt i feltet øverst (lar du feltet stå tomt, lagres du som *Anonym Utvikler*) og trykk **Start**.
3. Styr spilleren gjennom labyrinten til utgangen før tiden går ut ved å bruke **piltastene** eller **WASD** (eller knappene på skjermen).
4. **Tips:** Se nøye på veggene – enkelte vegger er svakt gjennomsiktige hemmelige passasjer du kan gå rett gjennom!
5. Når du når målet, lagres gjenværende tid automatisk i databasen, og **Hall of Fame** viser de 5 beste tidene.

---

## Installasjonsveiledning for utviklere (Raspberry Pi)
1. **Installer nødvendige pakker:**
   ```bash
   sudo apt update
   sudo apt install mariadb-server python3-flask python3-pymysql -y
   ```
2. **Opprett database og tabell i MariaDB:**
   ```sql
   CREATE DATABASE mazegame;
   USE mazegame;
   CREATE TABLE scores (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(50) NOT NULL,
       time INT NOT NULL
   );
   ```
3. **Konfigurer passord:** Åpne `app.py` og bytt ut `"DITT_PASSORD"` med passordet til databasebrukeren din.
4. **Start serveren:**
   ```bash
   python3 app.py
   ```

---

## Kilder og videreutvikling
* Grunnmuren til labyrintgeneratoren er basert på en YouTube-tutorial, og koden er videreutviklet med hjelp av KI som sparringspartner.
* Egne tilpasninger inkluderer WASD-styring, balanserte og gjennomsiktige hemmelige vegger med avstandssjekk, topp 5-filtrering og full integrasjon mot Flask og MariaDB.