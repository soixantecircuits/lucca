# Lucca

## Installation

```bash
$ npm i
$ bower install
```

In `dev` mode, you'll need to have a `app/img/data` folder filled with images. You wan download a serie of pictures in this [google drive folder](https://drive.google.com/drive/folders/0B83FWeLjxMvhWnY0THlVNnlXYmM/0B83FWeLjxMvhfktFSW5HdGtRMHh3bmxRSk9GMWJmMGtxUHdkUVlTbDlHSWlYREF3YllXc0U/0B83FWeLjxMvhflZmWXdSaXlVTVBSS2k3UEJ3cGU5UVZiRHJEZnhSS3hROVZiZERBbUtqdm8/0B83FWeLjxMvhfjJwUHNGb2hDZ1NGRE02YmpoQmhPNUJoemtHWUJaUWtVOE0zUHRsTnFNaEk/
0B83FWeLjxMvhfmNGUjE4WmxfWWRhN0J5XzJtWVdsSlpNbFp3NDVBbjBqNE16RTlzcEhhdms).

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
