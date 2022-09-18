# Converter

## Usage

### Preparation

Firstly, clone this repository.

```sh
git clone https://github.com/baiyuanneko/Converter
cd Converter
```

Then, create a ```source``` folder at the root directory of the repository.

```sh
mkdir source
```

### Then, if you don't need to distinguish logs from different server

Put the log files into ```source/``` folder as the following format.

```
source/2022-01-01-1.log
source/2022-01-01-2.log
source/2022-01-02-1.log
...
```

Then run the following command in the root directory of this repository.

```
npm run start
```

### If you need to distinguish logs from different server

Put the log files into ```source/``` folder as the following format.

```
source/MyServer/2022-01-01-1.log
source/MyServer/2022-01-02-1.log
source/MyServer/2022-01-02-2.log
source/MyServer2/2022-01-01-1.log
source/MyServer2/2022-01-02-1.log
...
```

Then run the following command in the root directory of this repository.

```
npm run convert
```