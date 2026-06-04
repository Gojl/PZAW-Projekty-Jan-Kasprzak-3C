3x3 PLL Database – Instrukcja konfiguracji i użycia

Ta aplikacja pozwala przeglądać algorytmy PLL i czasy na ostatnią warstwę kostki Rubika.

Możesz:
- Dodawać, edytować i usuwać własne algorytmy i czasy poprzez formularze i przyciski Edytuj / Usuń.
- Admin (login: admin) może przeglądać i edytować wszystkie algorytmy wszystkich użytkowników.

Instalacja i uruchomienie:

1. Sklonuj repozytorium
   git clone https://github.com/Gojl/PZAW-Projekty-Jan-Kasprzak-3C

2. Przejdź do folderu projektu
   cd projekt04

3. Zainstaluj wymagane pakiety Node.js
   npm install

4. Utwórz bazę danych
   node plls/plls.js

5. Uruchom serwer
   node index.js

6. Otwórz przeglądarkę i wejdź na
   http://localhost:6767

Funkcjonalności użytkownika:

- Rejestracja i logowanie z unikatowym loginem i hasłem (hasła są bezpiecznie hashowane przy użyciu argon2).
- Dodawanie nowych algorytmów PLL do własnej listy.
- Edycja i usuwanie własnych PLL.
- Widok Twoje PLL pokazuje tylko algorytmy użytkownika.

Funkcjonalności administratora:

- Login: admin (hasło też admin jeżeli się baza danych też klonuje, jeżeli nie to trzeba stworzyć konto o loginie admin)
- Dostęp do panelu admina pod /admin.
- Może przeglądać, edytować i usuwać PLL wszystkich użytkowników.
- Formularze edycji działają tylko dla admina – zwykli użytkownicy nie mogą edytować ani usuwać cudzych algorytmów.

Bezpieczeństwo:

- Hasła są przechowywane jako hash argon2 z wbudowaną solą.
- Sesje są obsługiwane za pomocą ciasteczek i zapisów w bazie danych.
- Nieautoryzowani użytkownicy nie mogą edytować ani usuwać cudzych danych.

Struktura aplikacji:

- index.js – serwer i główne routy.
- views/ – wszystkie widoki EJS (logowanie, rejestracja, PLL użytkownika i panel admina).
- plls/ – logika bazy danych i sesji.
- node_modules/ – zainstalowane pakiety Node.js.

Instrukcja użycia:

- Zarejestruj się jako użytkownik.
- Zaloguj się jako użytkownik
- Dodaj własny PLL przez formularz.
- Edytuj lub usuń własne algorytmy w widoku Twoje PLL.
- Zaloguj się jako admin (login: admin), aby przeglądać, edytować i usuwać wszystkie algorytmy.

Natalia B review:
- w readme jest błąd, żeby utworzyć baze z plls trzeba wpisać node plls/plls.js, a nie node plls.js. Poza tym readme oki 
- zamiast osobno tworzyć bazę danych jako osobny node tworzyłabym ją jeśli nie istnieje przy odpalaniu strony
- z podstrony twoje pll nie można się cofnąć do głównej strony więć np jeśli chcesz się tam cofnąć po zrobieniu algorytmu to musisz przejść przez formularz tworzenia
- aplikacja wygląda ładnie graficznie 
- panel admina dałabym od razu na koncie admina zamiast pod \admin
- kod ładnie napisany widać że aplikacja została przemyślana
