# Anisclo

[![Build Status](https://travis-ci.com/nebur395/Anisclo.svg?token=TeQnRfV979qCVxB8pdn2&branch=master)](https://travis-ci.com/nebur395/Anisclo)
[![codecov](https://codecov.io/gh/dari1495/Anisclo/branch/master/graph/badge.svg?token=zwkk1UO92a)](https://codecov.io/gh/dari1495/Anisclo)


## Start using this App!

In order to run this project you have to have installed
[node.js](http://nodejs.org) and npm. Once you have them, follow these steps:

  1. Clone this repo: `git clone https://github.com/nebur395/Anisclo`
  2. Open a terminal on the root folder of this project.
  3. Run the command `npm install`. This must be done the first time only, in order to
  install the dependencies of the project.
  4. Use the following command to start mongod: `sudo service mongod start`
  5. Get the necessary API keys in <a href="#apiKeys">this section</a>.
  5. To add an administrator user, please run the following command: `node initialize.js`. You will be able to
  log-in with this user with the email 'master@admin.com' and the password 'pass'.
  6. Run `npm start` in order to launch two instances of the server on port 8080 (HTTP) and 8443 (HTTPS).
  Alternatively, you can also use `node server.js`.
  7. Open a web browser (Preferably Mozilla Firefox or Chrome >55.X) and type http://localhost:8080 for the HTTP page, or https://localhost:8443 for the HTTPS equivalent.
  
## API keys
<a name="apiKeys">

To ensure a correct operation of the application you have to get the following API keys:  

**Google Map KEY**
1. Go to the file `/public/app.js` and put your api key in the 7 line.

**Google's reCaptcha KEY**
1. Go to the files `/public/templates/retrievePassword.html` (28 line) and `/public/templates/signUp.html` (39 line), and put your **PUBLIC** api key.
1. Go to the files `/routes/user/user.js` (107 line) and `/routes/user/user.js` (515 line), and put your **PRIVATE** api key.

**Google Login KEY**
1. Go to the file `/public/app.js` and place your Google client api key in line 37.
1. Go to the file `routes/user/user.js` and place your **secret** client api key in line 218.

## Send emails with Nodemailer
<a name="emails">

In order to be able to send emails when a user signs up, confirms it's registration or wants to retrieve a password, follow these steps:

1. Go to the file `routes/user/user.js` and follow the comments on the lines 1251, 1253 and 1254 to set up the SMTP service.
1. In that same file, go to lines 158, 553 and 628 and change the email on that lines with the one you used on the SMTP service setup.

In order to be able to send emails with a created route:

1. Go to the file `routes/poi/route.js` and follow the comments on the lines 491, 493 and 494 to set up the SMTP service.
1. In that same file, go to line 344 and change the email on that line with the one you used on the SMTP service setup.

## API DOC
In order to have a look at the project's API you have to follow these steps:
1. Run `npm start` in order to launch the application.
1. **JSON:** Open a web browser and type http://localhost:8080/swagger.json to display the application's API in a JSON.
1. **UI Web:** Open a web browser and type http://localhost:8080/api-docs/ to display the application's API in a UI web.

## Test
In order to run the [Protractor](http://www.protractortest.org/#/) tests of this project you have to follow these steps:
  1. Check that Protractor is working by running `node_modules/protractor/bin/protractor --version`.
  2. Now start up the Selenium Server: `node_modules/protractor/bin/webdriver-manager start`. This will output a bunch of info logs. You can see information about the status of the server at `http://localhost:4444/wd/hub`.
  3. Finally, execute `node_modules/protractor/bin/protractor test/protractor/conf.js`.
  
In order to run the [Mocha](https://mochajs.org/) tests of this project you only have to execute the following command: `npm test`

## EditorConfig 
[EditorConfig](http://editorconfig.org/) helps developers maintain consistent coding styles between different editors and IDEs. It is a file format for defining coding styles and a collection of text editor plugins that enable editors to read the file format and adhere to defined styles.
You need to create a .editorconfig file in which you define the coding style rules. It is similar to the format accepted by gitignore.

### IDEs supported by EditorConfig
These editors come bundled with native support for EditorConfig. Everything should just work: [BBEdit](http://www.barebones.com/support/technotes/editorconfig.html), [Builder](https://wiki.gnome.org/Apps/Builder/Features#EditorConfig), [CLion](https://github.com/JetBrains/intellij-community/tree/master/plugins/editorconfig), [GitHub](https://github.com/RReverser/github-editorconfig#readme), [Gogs](https://gogs.io/), [IntelliJIDEA](https://github.com/JetBrains/intellij-community/tree/master/plugins/editorconfig), [RubyMine](https://github.com/JetBrains/intellij-community/tree/master/plugins/editorconfig), [SourceLair](https://www.sourcelair.com/features/editorconfig), [TortoiseGit](https://tortoisegit.org/), [WebStorm](https://github.com/JetBrains/intellij-community/tree/master/plugins/editorconfig).

### IDEs not supported by EditorConfig file
To use EditorConfig with one of these editors, you will need to install a plugin: [AppCode](https://plugins.jetbrains.com/plugin/7294), [Atom](https://github.com/sindresorhus/atom-editorconfig#readme), [Brackets](https://github.com/kidwm/brackets-editorconfig/), [Coda](https://panic.com/coda/plugins.php#Plugins), [Code::Blocks](https://github.com/editorconfig/editorconfig-codeblocks#readme), [Eclipse](https://github.com/ncjones/editorconfig-eclipse#readme), [Emacs](https://github.com/editorconfig/editorconfig-emacs#readme), [Geany](https://github.com/editorconfig/editorconfig-geany#readme), [Gedit](https://github.com/editorconfig/editorconfig-gedit#readme), [Jedit](https://github.com/editorconfig/editorconfig-jedit#readme), [Komodo](http://komodoide.com/packages/addons/editorconfig/), [NetBeans](https://github.com/welovecoding/editorconfig-netbeans#readme), [NotePadd++](https://github.com/editorconfig/editorconfig-notepad-plus-plus#readme), [PhpStorm](https://plugins.jetbrains.com/plugin/7294), [PyCharm](https://plugins.jetbrains.com/plugin/7294), [Sublime Text](https://github.com/sindresorhus/editorconfig-sublime#readme), [Textadept](https://github.com/editorconfig/editorconfig-textadept#readme), [textmate](https://github.com/Mr0grog/editorconfig-textmate#readme), [Vim](https://github.com/editorconfig/editorconfig-vim#readme), [Visual Studio](https://github.com/editorconfig/editorconfig-visualstudio#readme), [Visual Studio Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig), [Xcode](https://github.com/MarcoSero/EditorConfig-Xcode)
