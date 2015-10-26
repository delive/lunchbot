# lunchbot

this is a simple slack lunch bot

to get started you'll need to do some of the following:

1) install node.js and npm (node package manager). i think i used yum (sudo yum install nodejs npm)

2) install the following node module dependencies in a parent directory of lunchbot:
```coffee-script  grunt  grunt-contrib-coffee  grunt-contrib-watch  grunt-release  grunt-shell  log  mocha  mysql  should  slack-client  ws```
to install them i did 'npm install x'. there is probably an oder of operations here, as some require some of the others. start with slack client, then mysql - those are the important two, which require the others.

3) you'll need mysql running locally. once thats up, you'll need the database and tables setup. look at the create table commands in mysql_setup.txt

4) you'll need to setup a config file that has passwords, the slack token, etc. i've included a sample config file, config_sample.js (it needs to be named config.js, in the parent directory of lunchbot).
