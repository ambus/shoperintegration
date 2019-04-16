# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
