Note:

v1.0.3
add react as peerDependencies

add webpack as devDependencies

in current package: 
if peer, wont install.
if dev, will install and appear in node_modules.

in consumer package:
if peer, wont install, will warn.
if dev, wont install, won't warn.

as a result, react is missing in local, webpack is available