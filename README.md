# MACROCOSM
[![Build Status](https://travis-ci.org/developmentseed/macrocosm.svg?branch=master)](https://travis-ci.org/developmentseed/macrocosm)

Macrocosm is a partial port of the Open Street Map [Ruby API](https://github.com/openstreetmap/openstreetmap-website) in NodeJS. With Macrocosm, you can host your own version of the OSM platform. It comes bundled with a [fork](https://github.com/macrocosm/iD) the [iD editor](https://github.com/openstreetmap/iD) that has been lightly modified to send data to a local Macrocosm API (more on that below). Macrocosm supports other data inputs, including direct uploads of OSM XML.

API docs are [available here](http://devseed.com/macrocosm/).

## What's included

1. **Changeset creation and upload**: create `nodes`, `ways`, `relations`, and their respective `tags`, using `changesets` to record metadata. Like in OSM, `changesets` record `create`, `modify`, and `delete` actions. Unlike OSM, there is no concept of closing `changesets`. They close after the last change is recorded.

2. **Bounding box queries**: allow you to specify a bounding box (lat/lon) to get all the elements contained within.

3. **Bulk uploads**: so you can populate an OSM-like database using OSM XML directly through the Macrocosm API.

## Installation

```sh
git clone git@github.com:developmentseed/macrocosm.git
cd macrocosm
npm install
```

## Local development using Docker
This repo comes with Docker configuration to spin up the API and a database. This same setup is also used by Travis to run tests against.

To set up your environment, make sure `docker` and `docker-compose` are installed on your machine. For Mac OS X and Windows download the [Docker Toolbox](https://www.docker.com/docker-toolbox). For Linux follow [these](https://docs.docker.com/compose/install/) instructions.

For Mac OS X or Windows, make sure you're running the following commands in a terminal that has the docker environment variables set. This can be done by running the `Docker Quickstart Terminal` app, or running `eval $(docker-machine env default)`. Linux users may need to use `sudo`

### Running the database
You can also just spin up the database and make it available on `$DOCKER_HOST:5433`:

```sh
npm run docker-start-db # start the db
npm run docker-kill-db # kills the db
```

### Running tests
The following command creates an empty postgres db, populates it with test data, and runs the tests against it.

```sh
npm run docker-test
```

## Running the API
It is also possible to run the API without Docker. This is for example useful if you want to connect directly to the database running in Docker.

Adapt the `local.js` file in your root directory that directs the API to a PostgreSQL database url (info on setting that up below). The placeholder contains the url for the database that Docker spins up.

```javascript
module.exports.connection = {
    production: 'postgres://USER:PASSWORD@HOST:POST/DATABASE',
}
```

Now you can run the API using `MACROCOSM_ENV=production npm run start`.

Macrocosm allows you to specify different databases using environment variables, eg. if you have separate testing and production databases. To specify different databases, structure your `local.js` file as such:

```js
module.exports.connection = {
    docker: 'postgres://osm:password@localhost:5432/macrocosm_test',
    production: 'postgres://USER:PASSWORD@HOST:POST/DATABASE',
    test: 'POSTGRES://USER2:OTHERPASS@TESTING.HOST.COM:PORT/DB'
}
```

Now you can run your tests on a separate database:

```sh
MACROCOSM_ENV=test npm run test
```

## Building the documentation locally

```sh
npm run gendoc
```

On a push to `master`, Travis builds the documentation and pushes it to Github Pages. The .js and .json files that are built by `npm run gendoc`, should not be committed to Github.

## Importing data

```bash
createdb macrocosm
psql -d macrocosm -f db-server/script/macrocosm-db.sql
osmosis \
  --read-pbf-fast delaware-latest.osm.pbf \
  --log-progress \
  --write-apidb database=macrocosm
```
