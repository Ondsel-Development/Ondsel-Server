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

To run from Docker, recompile with:

```bash
sudo docker build -t frontend .
```

and run (or re-run) with:

```bash
sudo docker run --env-file .env -p 80:80 --rm --name frontend frontend:latest
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
