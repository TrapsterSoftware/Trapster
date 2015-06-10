@echo off
echo Be aware of what are you doing
pause
copy trapster.png app\trapster.png
7z a app.zip app\*
7z a app.zip package.json
ren app.zip app.nw
copy /b nw.exe+app.nw trapster.exe
copy codecs\win32\ffmpegsumo.dll ffmpegsumo.dll /y
del app.nw
del nw.exe
del nwjc.exe
del package.json
del trapster.png
del .gitignore
rmdir /s /q app
rmdir /s /q codecs
rmdir /s /q crash_dump
rmdir /s /q node_modules
rmdir /s /q .git
del build.bat
exit