# Ondsel-Server

## Prerequisite

- Install MongoDB (https://www.mongodb.com/docs/manual/installation/).
- Install NodeJS (https://nodejs.org/en/download)
- Install Docker (https://docs.docker.com/engine/install/)

## Installation

### Running frontend

- Go to the `frontend` directory
- Rename `env.example` to `.env` (Or export variables)
- Install frontend dependencies `npm ci`
- Finally, run server `npm run dev`


```bash
$ cd frontend
$ mv env.example .env
$ set -a; . ./.env; set +a
$ npm ci
$ npm run dev
```

### Running sharefrontend

- Go to the `sharefrontend` directory
- Rename `env.example` to `.env` (Or export variables)
- create and start the VirtualEnv based on python 3.10
- within the venv, pip install the libraries (`requirements.txt`)
- within the venv, run server app.py


```bash
$ cd sharefrontend
$ mv env.example .env
$ set -a; . ./.env; set +a
$ python3.10 -m venv venv     # only on first creation
$ source venv/bin/activate
(venv) $ pip install -r requirements.txt
(venv) $ python app.py
```

### Running backend

- Go to the `backend` directory
- Rename `env.example` to `.env` (Or export variables)
- Install frontend dependencies `npm ci`
- Finally, run server `npm run dev`

```bash
$ cd backend
$ mv env.example .env
$ set -a; . ./.env; set +a
$ npm ci
$ npm run dev
```

### Running FC-Worker

- Clone [FC-Woker](https://github.com/Ondsel-Development/FC-Worker) repository.
- Build docker image (`docker build -t fc-worker .`)
- Run docker image (`docker run -p 9000:8080 --name fc_worker fc-worker:latest`)

```bash
$ git clone git@github.com:Ondsel-Development/FC-Worker.git
$ cd FC-Worker
$ docker build -t fc-worker .
$ docker run -p 9000:8080 --name fc_worker fc-worker:latest
```

## Important Links

- DEV
    - Frontend: http://ec2-54-234-132-150.compute-1.amazonaws.com:8080/
    - Backend API: http://ec2-54-234-132-150.compute-1.amazonaws.com/
    - API docs: http://ec2-54-234-132-150.compute-1.amazonaws.com/docs/
- Production
    - Frontend: https://lens.ondsel.com/
    - Backend API: https://lens-api.ondsel.com/
    - API docs: https://lens-api.ondsel.com/docs/
