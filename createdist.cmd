del /q dist\latest.zip
"C:\Program Files\7-Zip\7z.exe" a -tzip dist/latest.zip * -x!.git -x!dist -x!node_modules -x!data -x!app.config.*.js -x!nstart.cmd -x!cert\localhost-cert.pem -x!cert -x!.gitignore -x!package-lock.json -x!yarn.lock -x!createdist.cmd -x!package.json
git checkout demo
git merge --no-ff master
git checkout master
git push origin master
git push origin demo