
### Generate the certificate

```shell
openssl req -config ancgis.dev.net.conf -new -sha256 -newkey rsa:2048 -nodes -keyout ancgis.dev.net.key -x509 -days 36500 -out ancgis.dev.net.crt
```

Resources:
- [Https locally without browser privacy errors](https://deliciousbrains.com/https-locally-without-browser-privacy-errors/)

### Add the certificate locally

- Get the certificate from your brother.
- Add the certicicate with *certutil*:

```
sudo apt-get install libnss3-tools
certutil -d sql:$HOME/.pki/nssdb -A -t "P,," -n YOUR_FILE -i YOUR_FILE
certutil -d sql:$HOME/.pki/nssdb -L
```

Resources:
- [Add self signed ssl for chrome on ubuntu](
https://leehblue.com/add-self-signed-ssl-google-chrome-ubuntu-16-04/)

### Update the JSON Web Key Set (JWKS)

Open the *jwks.json* file and update the public key ("n") with the contents of the *ancgis.dev.net.crt* file. Replace the line breaks with "\n".

Resources:
- [JSON Web Key Generator](https://mkjwk.org/)
