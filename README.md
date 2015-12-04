# MACROCOSM

Macrocosm is a partial port of the Open Street Map [Ruby API](https://github.com/openstreetmap/openstreetmap-website) in NodeJS. With Macrocosm, you can host your own version of the OSM platform. It plays well with the [iD editor](https://github.com/openstreetmap/iD) but supports other data inputs, including direct uploads of OSM XML.

## What's included

1. **Changeset creation and upload**: create `nodes`, `ways`, `relations`, and their respective `tags`, using `changesets` to record metadata. Like in OSM, `changesets` record `create`, `modify`, and `delete` actions. Unlike OSM, there is no concept of closing `changesets`. They close after the last change is recorded.

2. **Bounding box queries**: allow you to specify a bounding box (lat/lon) to get all the elements contained within.

3. **Bulk uploads**: so you can populate an OSM-like database using OSM XML directly through the Macrocosm API.

## Installation

### Installing dependencies

```sh
git clone git@github.com:opengovt/macrocosm.git < TODO
cd macrocosm
npm install
```

### Running the server

Create a `local.js` file in your root directory that directs the API to the PostreSQL database url (info on setting that up below).

```javascript
module.exports.connection = {
    production: 'postgres://USER:PASSWORD@HOST:POST/DATABASE',
}
```

Now you can run the API using `MACROCOSM_ENV=production npm run start`.

Macrocosm allows you to specify different databases using environment variables, eg. if you have separate testing and production databases. To specify different databases, structure your `local.js` file as such:

```js
module.exports.connection = {
    production: 'postgres://USER:PASSWORD@HOST:POST/DATABASE',
    test: 'POSTGRES://USER2:OTHERPASS@TESTING.HOST.COM:PORT/DB'
}
```

Now you can run your tests on a separate database:

```sh
MACROCOSM_ENV=test npm run test
```

### Running the database

The `db-server` directory contains instructions on running your own postgresql database with the appropriate table schema using Docker. For Mac OS X users you might need [docker-machine](https://github.com/docker/machine) or [Kitematic](https://kitematic.com/)

Macrocosm uses a Postgres database. The database schema is lifted from OSM where it makes sense - some parts are redacted, others are slightly modified.

### Building the documentation locally

```sh
npm run gendoc
```
