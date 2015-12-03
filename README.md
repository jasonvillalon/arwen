# generator-arwen
Generator Atomic Restify Web NodeJS

### The idea of this framework is to use only what you need.

### Description
Inspired by [ARMET](https://github.com/armet/node-armet/) Clean and modern framework for creating RESTful APIs.

#Dependencies:
```
$ npm install -g yo
$ npm install -g bower
$ npm install -g gulp
```

# Installation:
```
$ git clone https://github.com/jasonvillalon/generator-arwen.git
$ npm link
```
# Uses:
```
$ mkdir testProj
$ cd testProj
$ yo arwen
```

# Create Component:
### Create component inside your project
# Usage
```
cd /root/folder/of/project
yo arwen:create-component

     _-----_
    |       |
    |--(o)--|   .--------------------------.
   `---------´  |    Welcome to Yeoman,    |
    ( _´U`_ )   |   ladies and gentlemen!  |
    /___A___\   '__________________________'
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `

You're using the Atomic generator.
? What would you like to call your component? Test
? What is the repository of this component (blank if same as project repo)?
? You want to add atomic component dependency? No
   create src/Test/index.js
   create src/Test/dependencies.js
   create src/Test/settings.js
DONE
```

# Install Component
### Install component dependency, you must be in the directory of another component
# Usage
```
cd src/Component1
yo arwen:install-component

     _-----_
    |       |
    |--(o)--|   .--------------------------.
   `---------´  |    Welcome to Yeoman,    |
    ( _´U`_ )   |   ladies and gentlemen!  |
    /___A___\   '__________________________'
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `

You"re using the Atomic generator.
? git repository or relative path to /src/ git@bitbucket.org:jasonvillalon/server.git
   create ../../config/default.js
   create ../../atomic.json
 conflict settings.js
? Overwrite settings.js? overwrite this and all others
    force settings.js
    force dependencies.js
DONE
```

# Install Component Dependencies
### This can be done on a project root or in a component directory
### if done inside project root. it means you are installing all the dependencies of the project
### if done inside component directory. it means you are installing all dependencies of the component
# Usage
```
yo arwen:install-component-deps

     _-----_
    |       |
    |--(o)--|   .--------------------------.
   `---------´  |    Welcome to Yeoman,    |
    ( _´U`_ )   |   ladies and gentlemen!  |
    /___A___\   '__________________________'
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `

You're using the Atomic generator.
Registering Test
   create ../../config/default.js
   create ../../atomic.json
```

# Creating a component
```
- src/
  - ComponentName
    - index.js
    - settings.js
    - dependencies.js
```
## Sample settings.js
### "dependencies" is the node dependencies of this component
### "AtomicDeps" is the other components used by this component
```
module.exports = {
  Name: "Crud",
  Description: "Crud",
  Repository: "git@bitbucket.org:jasonvillalon/crud.git",
  Version: "0.0.0",
  AtomicDeps: [],
  dependencies: {
    "bardo": "^0.1.0",
    "sql-bricks-postgres": "^0.4.1",
    "lodash": "^3.10.0"
  }
};
```  

## Sample dependencies.js
```
import Logger from "../Logger/index"
import * as Validators from "../Validators/index"
import Statics from "../Statics/index"
import throttle from "../throttle/index"


export default {  Logger,
  Validators,
  Statics,
  throttle,
}
```
# Sample index.js
```
import dependencies from "./dependencies"

let {Server} = dependencies

export function run() {
  console.log("Welcome to Atomic Project")
  Server.run()
}
```

# Check Changes
```
yo arwen:check-changes

     _-----_
    |       |
    |--(o)--|   .--------------------------.
   `---------´  |    Welcome to Yeoman,    |
    ( _´U`_ )   |   ladies and gentlemen!  |
    /___A___\   '__________________________'
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `

You"re using the Atomic generator.
Checking App
On branch master
Your branch is up-to-date with 'origin/master'.
nothing to commit, working directory clean
Checking Crud
On branch master
Your branch is up-to-date with 'origin/master'.
nothing to commit, working directory clean
```

# run
```
script/db-reset
script/db-migrate up
script/run
```
