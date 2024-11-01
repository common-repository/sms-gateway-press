
Useful commands:

1. List all coding standard issues:

```
$ ./vendor/bin/phpcs
```

2. Fix all coding standard issues:

```
$ ./vendor/bin/phpcbf
```

3. Check compatibility with a PHP version.

```
$ ./vendor/bin/phpcs -p src --standard=PHPCompatibility --runtime-set testVersion 7.3
```

4. Compile JS and CSS with hot reload for development:

```
$ npm run watch
```

