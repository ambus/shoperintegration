# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.5.3](https://github.com/ambus/shoperintegration/compare/v1.5.2...v1.5.3) (2019-08-13)


### Bug Fixes

* **config:** poprawiono nazwę typu EmailNotyfication ([f6cfb92](https://github.com/ambus/shoperintegration/commit/f6cfb92))
* **log:** add log to spy stream ([8e681b7](https://github.com/ambus/shoperintegration/commit/8e681b7))


### Build System

* **gulp:** dodano task aktualizujący na serwerze ftp konfigurację ([10ce973](https://github.com/ambus/shoperintegration/commit/10ce973))



### [1.5.2](https://github.com/ambus/shoperintegration/compare/v1.5.1...v1.5.2) (2019-06-04)



### [1.5.1](https://github.com/ambus/shoperintegration/compare/v1.5.0...v1.5.1) (2019-06-04)



## [1.5.0](https://github.com/ambus/shoperintegration/compare/v1.4.1...v1.5.0) (2019-06-04)


### Bug Fixes

* **fileWatcher:** zmieniono nazwę parametry określającego listę adresatów powiadomień ([7e87ed4](https://github.com/ambus/shoperintegration/commit/7e87ed4))


### Features

* **config:** dodano parametr określający dla jakich typów błędów ma być wysyłane powiadomienie ([a76c0b9](https://github.com/ambus/shoperintegration/commit/a76c0b9))
* **error:** błędy mają nowy schemat - są dodatkowym parametrem tasku ([a60342b](https://github.com/ambus/shoperintegration/commit/a60342b))
* **error:** dodano informację o typie błędu i wiadomości jeśli błąd występuje ([99d6b47](https://github.com/ambus/shoperintegration/commit/99d6b47))
* **error:** dodano nowy parametr w błędach - errorType ([33f6b99](https://github.com/ambus/shoperintegration/commit/33f6b99))


### Tests

* dostosowano testy do nowego schematu zwracania błędów ([d335e14](https://github.com/ambus/shoperintegration/commit/d335e14))
* dostosowano testy do nowego schematu zwracania błędów ([d920ef1](https://github.com/ambus/shoperintegration/commit/d920ef1))



### [1.4.1](https://github.com/ambus/shoperintegration/compare/v1.4.0...v1.4.1) (2019-05-30)


### Bug Fixes

* **replaceNotSupportedSight:** dla znaku # dodano jeszcze jeden backslash ([14dadf3](https://github.com/ambus/shoperintegration/commit/14dadf3))



## [1.4.0](https://github.com/ambus/shoperintegration/compare/v1.3.0...v1.4.0) (2019-05-21)


### Features

* **backup:** dodano parametr konfiguracyjny określający czy mają być wykonywane backup'y ([907f69c](https://github.com/ambus/shoperintegration/commit/907f69c))
* **config:** dodano parametr określający czy mamy wysyłać maile ([336e806](https://github.com/ambus/shoperintegration/commit/336e806))
* **fileWatcher:** file watcher pobiera konfigurację w konstruktorze ([4c14e5e](https://github.com/ambus/shoperintegration/commit/4c14e5e))
* **index:** dodano zmienianie nieobsługiwanych znaków ([4252584](https://github.com/ambus/shoperintegration/commit/4252584))
* **index:** poprawiono warunek sprawdzania ilości powtórzeń dla zadania ([abb6c89](https://github.com/ambus/shoperintegration/commit/abb6c89))
* **index:** przy uruchamianiu nie są już dokonywane próby odczytu pliku ([92c8cc4](https://github.com/ambus/shoperintegration/commit/92c8cc4))
* **replaceNotsupportedSight:** dodano funkcję podmieniającą niewspierane przez shopear znaki na kody ([6d9bddc](https://github.com/ambus/shoperintegration/commit/6d9bddc))


### Tests

* **email:** zmienną config w celach testowych zrobioną publiczną ([2a7f1cb](https://github.com/ambus/shoperintegration/commit/2a7f1cb))
* **index:** usunięto niepotrzebny mockup danych ([3dad043](https://github.com/ambus/shoperintegration/commit/3dad043))
* **index:** usunięto zdublowany test ([2dd9e92](https://github.com/ambus/shoperintegration/commit/2dd9e92))



## [1.3.0](https://github.com/ambus/shoperintegration/compare/v1.2.3...v1.3.0) (2019-05-20)


### Features

* **smtp:** rozbudowano konfigurację smtp ([27b1a6d](https://github.com/ambus/shoperintegration/commit/27b1a6d))



### [1.2.3](https://github.com/ambus/shoperintegration/compare/v1.2.2...v1.2.3) (2019-05-20)



### [1.2.2](https://github.com/ambus/shoperintegration/compare/v1.2.1...v1.2.2) (2019-05-20)



### [1.2.1](https://github.com/ambus/shoperintegration/compare/v1.2.0...v1.2.1) (2019-05-20)


### Bug Fixes

* **readme:** test zadania gulpowego ([ef0caa6](https://github.com/ambus/shoperintegration/commit/ef0caa6))



# [1.2.0](https://github.com/ambus/shoperintegration/compare/v1.1.0...v1.2.0) (2019-05-20)


### Bug Fixes

* **backup:** dodano mockowanie pliku w teście ([47ecc4e](https://github.com/ambus/shoperintegration/commit/47ecc4e))
* **backup:** poprawiono treść nagłówka dokumentu ([d65916c](https://github.com/ambus/shoperintegration/commit/d65916c))
* **config:** dodano brakujący model ShoperConfig ([cc808fa](https://github.com/ambus/shoperintegration/commit/cc808fa))
* **config:** usunięto w konfiguracji informację o ilości strumieni wykonujących połączenie z shoperem ([6350395](https://github.com/ambus/shoperintegration/commit/6350395))
* **createTask:** dodano brakujące pola ([04050a4](https://github.com/ambus/shoperintegration/commit/04050a4))
* **createTaskRequest:** dodano brakujące parametry ([ff4e38c](https://github.com/ambus/shoperintegration/commit/ff4e38c))
* **email:** poprawiono treści maili wysyłanych do użytkowników ([6034db6](https://github.com/ambus/shoperintegration/commit/6034db6))
* **fileWatcher:** odczyt pliku odbywa się na podstawie nazwy pliku otrzymanej przez watcher'a ([226e160](https://github.com/ambus/shoperintegration/commit/226e160))
* **filonMerchandise:** dodano jedno pole warunkowe w obiekcie FilonMerchandise - priceE ([97e36ff](https://github.com/ambus/shoperintegration/commit/97e36ff))
* **index:** dodano wiersz uruchamiający serwis ([6f950c5](https://github.com/ambus/shoperintegration/commit/6f950c5))
* **index:** podczas uruchamiania serwisu nie są od razu odczytywane dane dopiero gdy pojawią się w strumieniu ([d999417](https://github.com/ambus/shoperintegration/commit/d999417))
* **index:** poprawiono typy przekazywanych danych po parsowaniu ([b139aa1](https://github.com/ambus/shoperintegration/commit/b139aa1))
* **index:** usunięto zbędny consolelog ([ab68d77](https://github.com/ambus/shoperintegration/commit/ab68d77))
* **shoperService:** poprawiono treść wiadomości w przypadku napotkania błędu ([d262694](https://github.com/ambus/shoperintegration/commit/d262694))
* **shoperStockService:** poprawiono treść loggera ([3a2335a](https://github.com/ambus/shoperintegration/commit/3a2335a))
* **shoperStockService:** w przypadku gdy otrzymamy błąd a nie taska zwracany jest błąd ([efe79bd](https://github.com/ambus/shoperintegration/commit/efe79bd))
* **shoperToken:** podczas połączenia z zewnętrznym api do funkcji ajax przekazywana jest teraz funkcja zwracająca nowy obiekt XMLHttpRequest ([7e5a452](https://github.com/ambus/shoperintegration/commit/7e5a452))
* **test:** polecenie test jest uruchamiane w trybie verbose true ([4d758a5](https://github.com/ambus/shoperintegration/commit/4d758a5))
* **webpack:** poprawiono konfigurację webpacka aby działał z modułami nodejs ([d373deb](https://github.com/ambus/shoperintegration/commit/d373deb))
* **webpack:** zmieniono konfigurację webpacka ([9b17627](https://github.com/ambus/shoperintegration/commit/9b17627))


### Features

* dodano backup danych przychodzących z pliku ([98c22e5](https://github.com/ambus/shoperintegration/commit/98c22e5))
* dodano funkcję do pobierania token niezbędnego do połączenia z shoper api ([daabb9f](https://github.com/ambus/shoperintegration/commit/daabb9f))
* dodano nowe taski npm do uruchamiania testów ([ab0b77c](https://github.com/ambus/shoperintegration/commit/ab0b77c))
* **backup:** dodno operator do robienia backupu danych ([d13c35e](https://github.com/ambus/shoperintegration/commit/d13c35e))
* **compareService:** dodano transformację strumienia która dodaje obiekt do aktualizacji w shoperze ([015be84](https://github.com/ambus/shoperintegration/commit/015be84))
* **config:** dodano informację o ilości tasków które mogą współbierznie wykonywać zadania na połączeniu z shoperem ([2c5ddf5](https://github.com/ambus/shoperintegration/commit/2c5ddf5))
* **config:** dodano informację o maksymalnej liczbie prób w przypadku napotkania błędu ([f34b661](https://github.com/ambus/shoperintegration/commit/f34b661))
* **config:** dodano parametr określający lokalizację plików do backupu ([b15aa5c](https://github.com/ambus/shoperintegration/commit/b15aa5c))
* **config:** dodano parametr określający na jaki czas ma być wstrzymane wykonywanie kolejnego zadania po połączeniu z shoperem ([b688161](https://github.com/ambus/shoperintegration/commit/b688161))
* **config:** dodano pola z adresami do przesyłania notyfikacji ([f15dab4](https://github.com/ambus/shoperintegration/commit/f15dab4))
* **config:** dodano w konfiguracji adres api do aktualizacji productu ([b0df4a3](https://github.com/ambus/shoperintegration/commit/b0df4a3))
* **config:** dodano w konfiguracji opcję shopera ([2480e50](https://github.com/ambus/shoperintegration/commit/2480e50))
* **config:** w konfiguracji dodano parametry połączenia smtp ([dce1f45](https://github.com/ambus/shoperintegration/commit/dce1f45))
* **createTaskRequest:** dodano funkcję budującą zadanie do odpytania w shoperze ([9f8260f](https://github.com/ambus/shoperintegration/commit/9f8260f))
* **csvParser:** dodano OperatorFunction transformujący otrzymane dane w postaci stringa na FilonMerchandise[] ([07a6ed9](https://github.com/ambus/shoperintegration/commit/07a6ed9))
* **email:** dodano nowe pola konfiguracyjne potrzebne do wysyłki poczty email ([16c1a91](https://github.com/ambus/shoperintegration/commit/16c1a91))
* **email:** dodano pakiet nodemailer-smtp-transport ([11325bf](https://github.com/ambus/shoperintegration/commit/11325bf))
* **email:** dodano wstępny mockup funkcji wysyłającej maile ([f6522b7](https://github.com/ambus/shoperintegration/commit/f6522b7))
* **email:** skonfigurowano klasę do wysyłania wiadomości email ([d7ec9d7](https://github.com/ambus/shoperintegration/commit/d7ec9d7))
* **errorObject:** dodano obiekt reprezentujący błąd ([6e8e1c1](https://github.com/ambus/shoperintegration/commit/6e8e1c1))
* **errorTask:** w typie dodano informacje z danymi pobranymi z shopera ([5a76636](https://github.com/ambus/shoperintegration/commit/5a76636))
* **fileWatcher:** jeśli nie można odczytać pliku dodano powiadomienie @ do adminów ([446b694](https://github.com/ambus/shoperintegration/commit/446b694))
* **index:** dodano backup danych przychodzących w pliku ([46021ba](https://github.com/ambus/shoperintegration/commit/46021ba))
* **index:** dodano subskrybcję do wykonanych zadań ([3b8069d](https://github.com/ambus/shoperintegration/commit/3b8069d))
* **index:** dodano uruchamianie serwisu fileWatcher przy starcie ([f9bb4fb](https://github.com/ambus/shoperintegration/commit/f9bb4fb))
* **index:** podczas restartu serwisu wysyłana jest wiadomość z powitaniem do wszystkich osób które są na liście 'alerts' ([4ca708b](https://github.com/ambus/shoperintegration/commit/4ca708b))
* **konfiguracja:** dodano pole określające ile prób należy podjąć w przypadku błędu odczytu danych ([fb038fd](https://github.com/ambus/shoperintegration/commit/fb038fd))
* **readme:** aktualizacja zadań do wykonania ([af57f0f](https://github.com/ambus/shoperintegration/commit/af57f0f))
* **replaceComma:** dodano OperatorFunction zmieniający przecinki w cenach na kropki ([7250654](https://github.com/ambus/shoperintegration/commit/7250654))
* **retryStrategy:** dodano funkcję która ogranicza ilosć prób ponownej subkskrybcji w przypadku napotkania błędu ([89163b6](https://github.com/ambus/shoperintegration/commit/89163b6))
* **shoper:** dodano struktury danych reprezentujące dane zwracane z shopera ([7d7ad9a](https://github.com/ambus/shoperintegration/commit/7d7ad9a))
* **shoperGetToken:** observable zwracający obiekt AjaxRequest przeniesiono do osobnej funkcji ([09bf35d](https://github.com/ambus/shoperintegration/commit/09bf35d))
* **shoperGetToken:** w przypadku napotkania błędu dodano opcję ponownej próby połączenia ([569b936](https://github.com/ambus/shoperintegration/commit/569b936))
* **shoperReturnList:** dodan obiekt reprezentujący dane zwracane s shopera ([80212b8](https://github.com/ambus/shoperintegration/commit/80212b8))
* **shoperservice:** w przypadku niepowodzenia wykonania zadania jest ponawiana próba okresloną w konfiguracji ilość razy ([1f52620](https://github.com/ambus/shoperintegration/commit/1f52620))
* **shoperService:** dodane zadania są najpierw wykonywane a później pojawiają się w strumieniu wykonanych zadań ([963e3e7](https://github.com/ambus/shoperintegration/commit/963e3e7))
* **shoperService:** dodanie konstruktora ShoperService ([d646e68](https://github.com/ambus/shoperintegration/commit/d646e68))
* **shoperService:** dodano funkcję która będzie odpowiedzialna za wykonanie Taska ([33472a1](https://github.com/ambus/shoperintegration/commit/33472a1))
* **shoperService:** dodano funkcję ustawiającą connection token do taska ([f91ecc7](https://github.com/ambus/shoperintegration/commit/f91ecc7))
* **shoperService:** dodano informację o czasie w jakim zadanie zostało zakończone z sukcesem oraz loggery ([d77b64b](https://github.com/ambus/shoperintegration/commit/d77b64b))
* **shoperService:** dodano pobieranie stock'a w wątku zadania ([97dbd64](https://github.com/ambus/shoperintegration/commit/97dbd64))
* **shoperService:** dodano strumień do podpinania taskMakerów ([167263c](https://github.com/ambus/shoperintegration/commit/167263c))
* **shoperService:** po dodaniu towaru do serwisu jest on konwertowany do Taska i wrzucany do strumienia ([4b9aca9](https://github.com/ambus/shoperintegration/commit/4b9aca9))
* **shoperService:** ustawiono treść maila w przypadku napotkania błędu podczas aktualizacji ([e504951](https://github.com/ambus/shoperintegration/commit/e504951))
* **shoperService:** w przypadku napotkania błędu następuje 3 krotnie ponowienie próby jego wykonania ([44a8893](https://github.com/ambus/shoperintegration/commit/44a8893))
* **ShoperService:** w strumień taska wpięto generator obiektu do aktualizacji oraz serwis wysyłający do shopera nowe dane ([0e026ff](https://github.com/ambus/shoperintegration/commit/0e026ff))
* **shoperStockService:** dodano mockup serwisu ShoperStockService ([cf74a81](https://github.com/ambus/shoperintegration/commit/cf74a81))
* **shoperStockService:** zbudowano serwis zwracający informację o pobranym stocku ([c28ee18](https://github.com/ambus/shoperintegration/commit/c28ee18))
* **shoperUpdateService:** dodano serwis do aktualizacji danych w shoperze ([0606862](https://github.com/ambus/shoperintegration/commit/0606862))
* **shoperUpdateService:** usunięto testowe ogranicznenie ([75b7845](https://github.com/ambus/shoperintegration/commit/75b7845))
* **task:** dodano funkcję ustawiającą status na obiekcie taska w strumieniu ([c61a818](https://github.com/ambus/shoperintegration/commit/c61a818))
* **task:** dodano informację o czasie w jakim zadanie zostało wykonane ([95a9b87](https://github.com/ambus/shoperintegration/commit/95a9b87))
* **task:** dodano parametr z obiektem który przesyłany jest do shopera w celu aktualizacji ([43c5e47](https://github.com/ambus/shoperintegration/commit/43c5e47))
* **task:** dodano pole informujące o obecnym statusie zadania ([fe7ff95](https://github.com/ambus/shoperintegration/commit/fe7ff95))
* **task:** przy tworzeniu taska otrzymuje ono status requested ([671e776](https://github.com/ambus/shoperintegration/commit/671e776))
* **task:** przywrócono informację o ilości prób wykonania danego taska ([fb6de61](https://github.com/ambus/shoperintegration/commit/fb6de61))
* **task:** usunięto pola odpowiadające za informacje i liczbie prób wykonania zadania ([9a27d43](https://github.com/ambus/shoperintegration/commit/9a27d43))
* **task:** w obiekcie tasku dodano pola z obiektem do wysłania do shopera oraz statusem aktualizacji ([85a3397](https://github.com/ambus/shoperintegration/commit/85a3397))
* **TaskStatus:** dodano nowy status - error ([0b82c11](https://github.com/ambus/shoperintegration/commit/0b82c11))
* **token:** dodano parametr z tokenem do połączenia z shoperem ([288cd5f](https://github.com/ambus/shoperintegration/commit/288cd5f))



# [1.1.0](https://github.com/ambus/shoperintegration/compare/v1.0.0...v1.1.0) (2019-04-16)


### Features

* **tokenGeneration:** Dodano generowanie tokenów ([20c92ea](https://github.com/ambus/shoperintegration/commit/20c92ea))



# 1.0.0 (2019-04-15)


### Bug Fixes

* **csv-parser:** poprawiono funkcję sprawdzającą czy w sparsowanym obiekcie są wszystkie wymagane pola ([437b3da](https://github.com/ambus/shoperintegration/commit/437b3da))
* **fileWatcher:** poprawiono adres pliku do odczytu ([dc0641f](https://github.com/ambus/shoperintegration/commit/dc0641f))
* **logger:** poprawiono lokalizację pliku z konfiguracją ([23fa7ed](https://github.com/ambus/shoperintegration/commit/23fa7ed))


### Features

* dodano konfigurację webpack'a ([7ecfa5b](https://github.com/ambus/shoperintegration/commit/7ecfa5b))
* utworzono zalążek funkcji służącej do uruchamiania systemu ([87268f7](https://github.com/ambus/shoperintegration/commit/87268f7))
* **csv-parser:** dodano funkcję parsującą obiekt csv do javascript object ([3732c59](https://github.com/ambus/shoperintegration/commit/3732c59))
* **csv-parser:** dodano funkcję parsującą stringa w formacie csv na obiekt javascript ([2adb70c](https://github.com/ambus/shoperintegration/commit/2adb70c))
* **filewatcher:** dodano funkcję odczytywania pliku i przekazywania funkcji do strumienia ([386bd93](https://github.com/ambus/shoperintegration/commit/386bd93))
* **filewatcher:** dodano funkcję usuwania pliku ([0409397](https://github.com/ambus/shoperintegration/commit/0409397))
* **fileWatcher:** dodano serwis do obserwowania plików ([77ecc4d](https://github.com/ambus/shoperintegration/commit/77ecc4d))
* **fileWatcher:** obiekt filewatcher'a wykorzystuje strumienie ([f63ea0f](https://github.com/ambus/shoperintegration/commit/f63ea0f))
* **fileWatcher:** podczas budowanie obiektu pobierana jest instancja konfiguracji ([944bfe3](https://github.com/ambus/shoperintegration/commit/944bfe3))
* **logger:** dodano ładowanie konfiguracji z zewnętrznego pliku ([b0fbffc](https://github.com/ambus/shoperintegration/commit/b0fbffc))
* **logger:** dodano logowanie poprzez bibliotekę log4js ([53fadf5](https://github.com/ambus/shoperintegration/commit/53fadf5))
* **logger:** dodano obsługę log4js ([56ccf83](https://github.com/ambus/shoperintegration/commit/56ccf83))


### BREAKING CHANGES

* **fileWatcher:** fileWatcher od razu zwraca strumienie
Merge branch 'rxFileWatcher'
