# Lucca

## Installation

```bash
$ npm i
$ bower install
```

In `dev` mode, you'll need to have a `app/img/data` folder filled with images. You wan download a serie of pictures in this [google drive folder](https://drive.google.com/folderview?id=0B0XU5Cf3GpodfkY2VkZSSEtWV2FiNkR1b3pab09JVEVxRnVFekk5WV9PQy1QX2Jncm1qNDQ&usp=sharing).

## Usage
- In browser:
```bash
$ npm start
```
use to be : `grunt browser`

- In nw:
```bash
$ grunt dist-xxxx
```
> Depending on your platform, it can be:
>
>`grunt dist-linux / dist-linux32 / dist-win / dist-mac / dist-mac32`

You can set the `dev` parameter of the `config` object to `true` if you want to use fake pictures.

## To Do
- Get nw from grunt task
