# Call blocker

## Description

Allows tracking phone numbers which took part in spam or other suspicious activity

## Project setup (build and run)

```bash
$ make
```

## Run / stop services

```bash
# development
$ make compose/up

# stop
$ make compose/down

# rebuild and start again
$ make
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ make compose/test
```

## Obtain api key

```bash
make get-api-key
```
